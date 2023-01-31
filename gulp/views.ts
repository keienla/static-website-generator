import config from '../config'
import { clean, constructPageUrl, folders, getPathFiles, baseUrl, getFileName } from './utils'
import { src, dest } from 'gulp'
import replace from 'gulp-replace'
import rename from 'gulp-rename'
import pug from 'gulp-pug'
import merge from 'gulp-merge'
import clone from 'gulp-clone'
import through from 'through2'
import { AdvancedLanguages, Languages } from '../src/interfaces/translation.interface'

/**
 * @param  {string} name
 * @param  {string[]} paths
 * @returns string | null
 */
function _getPathTemplate(name: string, paths: string[]): string | null {
    if (!paths?.length || !name) return null

    for (let i = 0; i < paths.length; i++) {
        const pathSplitted: string[] = paths[i].split('/')
        if (pathSplitted[pathSplitted.length - 1] === name) return paths[i]
    }

    return null
}

/**
 * Clean all the HTML files in the dist folder
 * @returns NodeJS.ReadWriteStream
 */
export function cleanViews(): NodeJS.ReadWriteStream {
    const languages = config.languages.filter((language) => {
        const lang: string = typeof language === 'string' ? language : language.lang
        return lang !== config.defaultLanguage
    })
    return clean([`${folders.dist.default}/**/*.html`])
}

export function generateViews(next: any): void {
    const entries = src(`${folders.pages}/**/*.ts`, { allowEmpty: true })

    const actions = config.languages.map((language) => {
        return entries.pipe(clone()).pipe(_generateView(language))
    })

    if (actions.length) merge(...actions).on('end', next)
    else next()
}

function _generateView(language: Languages | AdvancedLanguages) {
    return through.obj(async (file, enc, cb) => {
        const currentLang = typeof language === 'string' ? language : language.lang
        const name = file.stem

        let fileFolder: '/' | `/${string}/` = (file.dirname
            .replace(file.base, '')
            .replace(/\\/g, '/') + '/') as '/' | `/${string}/`
        const fileName =
            (currentLang === config.defaultLanguage ? '' : currentLang) +
            fileFolder +
            (name === 'index' ? name + '.html' : name + '/index.html')
        const url = constructPageUrl(
            currentLang,
            'index',
            (fileFolder + (name === 'index' ? '' : name + '/')) as any
        )

        const alternatesPages = config.languages.map((language) => {
            const lang = typeof language === 'string' ? language : language.lang
            return {
                hreflang: lang === config.defaultLanguage ? 'x-default' : lang,
                href: constructPageUrl(lang, name, fileFolder),
            }
        })

        const page = (await require(file.path))?.default
        // Remove the cache of the page to refresh when update the file
        delete require.cache[file.path]

        if (!page || !page._template) {
            console.info('No template for page ' + file.path)
            return cb()
        }

        const templates = getPathFiles(folders.src.views, '.pug')

        const pugPath = _getPathTemplate(page._template + '.pug', templates)

        if (!pugPath) {
            console.warn(
                'No pug template "' +
                    page._template +
                    '" for page ' +
                    file.path +
                    ' in ' +
                    folders.src.views
            )
            return cb()
        }

        src(pugPath, { allowEmpty: true })
            .pipe(
                pug({
                    doctype: '',
                    pretty: false,
                    locals: {
                        page,
                        currentPageFolder: fileFolder + (name === 'index' ? '' : name + '/'),
                        currentPageName: 'index.html',
                        language: currentLang,
                        languages: config.languages.map((l) =>
                            typeof l === 'string' ? l : l.lang
                        ),
                        defaultLanguage: config.defaultLanguage,
                        isDefaultLanguage: currentLang === config.defaultLanguage,
                        dir: typeof language === 'string' ? 'ltr' : language.dir,
                        alternates: alternatesPages,
                        baseUrl,
                        url,
                        config,
                    },
                    cache: true,
                } as any)
            )
            .pipe(replace(/\.s[ac]ss/g, '.css', {}))
            .pipe(replace(/\.tsx?/g, '.js'))
            .pipe(rename(fileName))
            .pipe(dest(folders.dist.default))

        return cb(null, file)
    })
}
