const { clean, config, constructPageUrl, folders, getPathFiles, baseUrl } = require('./utils')
const { src, dest, lastRun } = require('gulp')
const replace = require('gulp-replace')
const rename = require('gulp-rename')
const pug = require('gulp-pug')
const ts = require('gulp-typescript')
const merge = require('gulp-merge')
const clone = require('gulp-clone')
const tsProject = ts.createProject(__dirname +  '/../pages/tsconfig.json')
const through = require('through2');

function _getPathTemplate(name, paths) {
    if(!paths?.length || !name) return null

    for(let i = 0; i < paths.length; i++) {
        const pathSplitted = paths[i].split('/')
        if(pathSplitted[pathSplitted.length - 1] === name) return paths[i]
    }

    return null
}

function _cleanJSViews() {
    return clean(folders.tmp.pages)
}

function _cleanViews() {
    const languages = config.languages.filter(language => {
        const lang = typeof language.lang === 'string' ? language.lang : language
        return lang !== config.defaultLanguage
    })
    return clean([
        ...languages.map(language => `${folders.dist.default}/${language}`),
        `${folders.dist.default}/*.html`
    ])
}

function _generateJSViews(cb) {
    return src(`${folders.pages}/**/*.ts`, {allowEmpty: true, since: lastRun(_generateJSViews)})
        // compile to JS
        .pipe(tsProject()).js
        .pipe(dest(folders.tmp.pages))
}

async function _generateViews(next) {
    const entries = src(`${folders.tmp.pages}/**/*.js`, {allowEmpty: true, since: lastRun(_generateViews)})

    const actions = config.languages.map(language => {
        return entries
            .pipe(clone())
            .pipe(_generateView(language))
    })

    if(actions.length)
        return merge(...actions)

    next()
}

function _generateView(language) {
    return through.obj(async (file, enc, cb) => {
        const currentLang = typeof language.lang === 'string' ? language.lang : language
        const name = file.stem

        const fileName = (currentLang === config.defaultLanguage ? '' : currentLang + '/') + name + '.html'
        const url = constructPageUrl(currentLang, name)

        const alternatesPages = config.languages.map(language => {
            const lang = typeof language.lang === 'string' ? language.lang : language
            return {
                hreflang: lang === config.defaultLanguage ? 'x-default' : lang,
                href: constructPageUrl(lang, name),
            }
        })

        const page = (await require(file.path))?.default

        if(!page || !page._template) {
            console.info('No template for page ' + file.path)
            return cb()
        }

        const templates = getPathFiles(folders.src.views, '.pug')

        const pugPath = _getPathTemplate(page._template + '.pug', templates)

        if(!pugPath) {
            console.warn('No pug template "' + page._template + '" for page ' + file.path + ' in ' + folders.src.views)
            return cb()
        }

        src(pugPath, {allowEmpty: true})
            .pipe(pug({
                doctype: '',
                pretty: false,
                locals: {
                    page,
                    language: currentLang,
                    dir: language.dir ? language.dir : 'ltr',
                    alternates: alternatesPages,
                    baseUrl,
                    url,
                    config,
                },
                cache: true
            }))
            .pipe(replace(/\.s[ac]ss/g, '.css', {}))
            .pipe(replace(/\.tsx?/g, '.js'))
            .pipe(rename(fileName))
            .pipe(dest(folders.dist.default))

        return cb(null, file)
    })
}

module.exports = {
    cleanJSViews: _cleanJSViews,
    cleanViews: _cleanViews,
    generateJSViews: _generateJSViews,
    generateViews: _generateViews
}