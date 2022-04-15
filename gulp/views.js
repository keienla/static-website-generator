const { clean, config, constructPageUrl, folders, getFileName, getPathFiles, readTSFile, baseUrl } = require('./utils')
const { src, dest, series, parallel } = require('gulp')
const replace = require('gulp-replace')
const rename = require('gulp-rename')
const wait = require('gulp-wait')
const pug = require('gulp-pug')

function _getPathTemplate(name, paths) {
    if(!paths?.length || !name) return null

    for(let i = 0; i < paths.length; i++) {
        const pathSplitted = paths[i].split('/')
        if(pathSplitted[pathSplitted.length - 1] === name) return paths[i]
    }

    return null
}

async function _cleanDistViews() {
    const languages = config.languages.filter(language => {
        const lang = typeof language.lang === 'string' ? language.lang : language
        return lang !== config.defaultLanguage
    })
    return clean([...languages.map(language => `${folders.dist.default}/${language}`), `${folders.dist.default}/*.html`])
}

const dataPages = getPathFiles(folders.pages, '.ts')
const templates = getPathFiles(folders.src.views, '.pug')

function _compileViews() {
    const transformations = dataPages.reduce((acc, viewPath) => {
        const actions = []

        config.languages.forEach(language => {
            const currentLang = typeof language.lang === 'string' ? language.lang : language
            const {name} = getFileName(viewPath)

            const fileName = (currentLang === config.defaultLanguage ? '' : currentLang + '/') + name + '.html'
            const url = constructPageUrl(currentLang, name)

            const alternatesPages = config.languages.map(language => {
                const lang = typeof language.lang === 'string' ? language.lang : language
                return {
                    hreflang: lang === config.defaultLanguage ? 'x-default' : lang,
                    href: constructPageUrl(lang, name),
                }
            })

            actions.push(function _compileView(next) {
                // Transpile the .ts to js and get the data
                const page = readTSFile(viewPath)

                if(!page || !page._template) {
                    console.error('No template for page ' + viewPath)
                    return next()
                }

                const pugPath = _getPathTemplate(page._template + '.pug', templates)

                if(!pugPath) {
                    console.error('No pug template "' + page._template + '" for page ' + viewPath + ' in ' + folders.src.views)
                    return next()
                }

                return src(pugPath, {allowEmpty: true})
                // wait to be sure that dist files are deleted
                // else error with rename
                    .pipe(wait(100))
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
            })
        })

        if(actions.length) {
            return [...acc, ...actions]
        }

        return acc
    }, [])

    if(!transformations.length) {
        return [async function _noPage() {}]
    }

    return transformations
}

module.exports = series(
    _cleanDistViews,
    parallel(
        ..._compileViews()
    )
)