const path = require('path')
const typescript = require('typescript')
const fs = require('fs')

const { src } = require('gulp')
const gulpClean = require('gulp-clean')

const folders = {
    src: {
        default: './src',
        get views() { return `${this.default}/templates` },
        get style() { return `${this.default}/style` },
        get script() { return `${this.default}/script` },
        get images() { return `./assets/img` },
        get fonts() { return `./assets/fonts` },
    },
    dist: {
        default: './dist',
        get views() { return `${this.default}/pages` },
        get style() { return `${this.default}/style` },
        get script() { return `${this.default}/script` },
        get assets() { return `${this.default}/assets` },
        get images() { return `${this.default}/assets/img` },
        get fonts() { return `${this.default}/assets/fonts` },
    },
    pages: './pages',
}

/**
 * @param  {string} srcPath
 */
function readTSFile(srcPath) {
    return eval(typescript.transpile(fs.readFileSync(srcPath, 'utf8').toString()))
}

const config = readTSFile('./config.ts')

const baseUrl = `http${config.https ? 's' : ''}://${config.prefix ? config.prefix + '.' : ''}${config.domain}${config.port ? ':' + config.port : ''}`

/**
 * Extract filename, extension and filename + '.' + extension from a path
 * @param  {string} path
 * @returns {name: string, extension: string, full: string}
 */
function getFileName(srcPath) {
    const full = path.basename(srcPath)
    const nameDotSplitted = path.basename(srcPath).split('.')
    const name = nameDotSplitted.slice(0, nameDotSplitted.length - 1).join('.')
    const extension = nameDotSplitted[nameDotSplitted.length - 1]
    return {name, extension, full}
}

/**
 * Construct full url for page with name and language
 * @param  {string} language
 * @param  {string} name
 * @returns {string}
 */
function constructPageUrl(language, name) {
    return `${baseUrl}/${language === config.defaultLanguage ? '' : language + '/'}${name === 'index' ? '' : name + '.html'}`
}

/**
 * A folder or file to delete
 * @param  {string|string[]} srcPath
 */
function clean(srcPath) {
    return src(srcPath, { read: false, allowEmpty: true }).pipe(gulpClean({force: true}))
}

// export function replaceContent(newContent) {
//     return through.obj((file, enc, cb) => {
//         file.contents = Buffer.from(newContent)
//         return cb(null, file)
//     })
// }

/**
 * @param  {string} folder
 * @param  {string} extension
 */
function getPathFiles(folder, extension) {
    try {
        const stats = fs.statSync(folder)

        if(stats.isDirectory()) {
            const els = fs.readdirSync(folder)
            if(els.length) {
                const response = els.reduce((acc, fileFolder) => {
                    const filePaths = getPathFiles(folder + '/' + fileFolder, extension)
                    if(Array.isArray(filePaths)) {
                        return [...acc, ...filePaths]
                    } else if(filePaths) {
                        return [...acc, filePaths]
                    }
                    return acc
                }, [])
                return response
            }
        } else if(stats.isFile()) {
            const fileExtension = path.extname(folder);
            if(fileExtension === extension || !extension) {
                return folder
            }
        }
        return []
    } catch(err) {
        return []
    }
}

async function findFollowedNofollowedPages() {
    const pagesPath = await getPathFiles(folders.pages, '.ts')
    const followedPages = []
    const nofollowedPages = []
    const noindexedPages = []

    function add(arr, page, data) {
        config.languages.forEach(language => {
            const lang = typeof language.lang === 'string' ? language.lang : language
            const name = getFileName(page).name
            arr.push({name, lang, data, url: constructPageUrl(lang, name), src: page})
        })
    }

    for(const page of pagesPath) {
        const pageData = readTSFile(page)
        const nofollowed = pageData._nofollow || false
        const noindexed = pageData._noindex || false

        if(nofollowed) {
            add(nofollowedPages, page, pageData)
        } else {
            add(followedPages, page, pageData)
        }

        if(noindexed) {
            add(noindexedPages, page, pageData)
        }
    }

    return {followedPages, nofollowedPages, noindexedPages}
}

/**
 * Check if there is srcPath, if not create the folder
 * @param  {string} srcPath
 */
function mkdir(srcPath) {
    const exist = fs.existsSync(srcPath)
    if(exist) return void 0
    fs.mkdirSync(srcPath)
}

module.exports = {
    folders,
    readTSFile,
    config,
    baseUrl,
    getFileName,
    constructPageUrl,
    clean,
    getPathFiles,
    findFollowedNofollowedPages,
    mkdir
}