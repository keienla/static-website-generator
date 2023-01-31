import * as path from 'path'
import * as fs from 'fs'

import { src } from 'gulp'
import gulpClean from 'gulp-clean'
import * as through from 'through2'
import config from './../config'

export const folders = {
    src: {
        default: './src',
        get views() {
            return `${this.default}/templates`
        },
        get style() {
            return `${this.default}/style`
        },
        get script() {
            return `${this.default}/script`
        },
        get images() {
            return `./assets/img`
        },
        get fonts() {
            return `./assets/fonts`
        },
    },
    dist: {
        default: './dist',
        get views() {
            return `${this.default}/pages`
        },
        get style() {
            return `${this.default}/style`
        },
        get script() {
            return `${this.default}/script`
        },
        get assets() {
            return `${this.default}/assets`
        },
        get images() {
            return `${this.default}/assets/img`
        },
        get fonts() {
            return `${this.default}/assets/fonts`
        },
    },
    pages: './pages',
}

export const baseUrl = `http${config.https ? 's' : ''}://${
    config.prefix ? config.prefix + '.' : ''
}${config.domain}${config.port ? ':' + config.port : ''}`

/**
 * Extract filename, extension and filename + '.' + extension from a path
 * @param  {string} path
 * @returns {name: string, extension: string, full: string}
 */
export function getFileName(srcPath: string): { name: string; extension: string; full: string } {
    const full = path.basename(srcPath)
    const nameDotSplitted = path.basename(srcPath).split('.')
    const name = nameDotSplitted.slice(0, nameDotSplitted.length - 1).join('.')
    const extension = nameDotSplitted[nameDotSplitted.length - 1]
    return { name, extension, full }
}

/**
 * Construct full url for page with name and language
 * @param  {string} language
 * @param  {string} name
 * @returns {string}
 */
export function constructPageUrl(
    language: string,
    name: string,
    fileFolders: '/' | `/${string}/` = '/'
): string {
    return `${baseUrl}${language === config.defaultLanguage ? '' : '/' + language}${fileFolders}${
        name === 'index' ? '' : name + '.html'
    }`
}

/**
 * A folder or file to delete
 * @param  {string|string[]} srcPath
 */
export function clean(srcPath: string | string[]): NodeJS.ReadWriteStream {
    return src(srcPath, { read: false, allowEmpty: true }).pipe(gulpClean({ force: true }))
}

/**
 * Replace the content of a file by new content given
 * @param  {string} newContent
 * @returns {NodeJS.ReadWriteStream}
 */
export function replaceContent(newContent: string): NodeJS.ReadWriteStream {
    return through.obj((file, enc, cb) => {
        file.contents = Buffer.from(newContent)
        return cb(null, file)
    })
}

/**
 * Log the info of the stream
 * @returns {NodeJS.ReadWriteStream}
 */
export function log(): NodeJS.ReadWriteStream {
    return through.obj(async (file, enc, cb) => {
        console.log({
            contents: file.contents.toString(),
            stat: file.stat,
            base: file.base,
            path: file.path,
            relative: file.relative,
            basename: file.basename,
            extname: file.extname,
            stem: file.stem,
            dirname: file.dirname,
            history: file.history,
        })
        return cb(null, file)
    })
}

/**
 * @param  {string} folder
 * @param  {string} extension
 */
export function getPathFiles(folder: string, extension: string): string[] {
    try {
        const stats = fs.statSync(folder)

        if (stats.isDirectory()) {
            const els = fs.readdirSync(folder)
            if (els.length) {
                const response = els.reduce<string[]>((acc, fileFolder) => {
                    const filePaths = getPathFiles(folder + '/' + fileFolder, extension)
                    return [...acc, ...filePaths]
                }, [])
                return response
            }
        } else if (stats.isFile()) {
            const fileExtension = path.extname(folder)
            if (fileExtension === extension || !extension) {
                return [folder]
            }
        }
        return []
    } catch (err) {
        return []
    }
}

type TFollowedNoFollowedPage = {
    name: string
    lang: string
    data: any
    url: string
    src: string
}

export async function findFollowedNofollowedPages(): Promise<{
    followedPages: TFollowedNoFollowedPage[]
    nofollowedPages: TFollowedNoFollowedPage[]
    noindexedPages: TFollowedNoFollowedPage[]
}> {
    const pagesPath = getPathFiles(folders.pages, '.ts')
    const followedPages: TFollowedNoFollowedPage[] = []
    const nofollowedPages: TFollowedNoFollowedPage[] = []
    const noindexedPages: TFollowedNoFollowedPage[] = []

    function add(arr: TFollowedNoFollowedPage[], page: string, data: any) {
        config.languages.forEach((language) => {
            const lang = typeof language === 'string' ? language : language.lang
            const name = getFileName(page).name
            arr.push({
                name,
                lang,
                data,
                url: constructPageUrl(lang, 'index', name === 'index' ? '/' : `/${name}/`),
                src: page,
            })
        })
    }

    for (const page of pagesPath) {
        try {
            const pageData = await require('./.' + page)?.default

            if (!pageData._template) continue

            const nofollowed: boolean = pageData._nofollow || false
            const noindexed: boolean = pageData._noindex || false

            if (nofollowed) {
                add(nofollowedPages, page, pageData)
            } else {
                add(followedPages, page, pageData)
            }

            if (noindexed) {
                add(noindexedPages, page, pageData)
            }
        } catch (err) {
            continue
        }
    }

    return { followedPages, nofollowedPages, noindexedPages }
}

/**
 * Check if there is srcPath, if not create the folder
 * @param  {string} srcPath
 * @returns void
 */
export function mkdir(srcPath): void {
    const exist = fs.existsSync(srcPath)
    if (exist) return void 0
    fs.mkdirSync(srcPath)
}
