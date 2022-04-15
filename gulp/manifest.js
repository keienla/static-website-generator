const { clean, folders, config, mkdir } = require("./utils")
const { series } = require('gulp')
const fs = require('fs')

function _cleanManifest() {
    return clean(`${folders.dist.default}/**/manifest.json`)
}

async function _createManifest() {
    config.languages.forEach(language => {
        const lang = typeof language.lang === 'string' ? language.lang : language
        const isDefault = lang === config.defaultLanguage

        const manifest = {
            name: config.name[lang],
            short_name: config.shortName ? config.shortName[lang] : config.name[lang],
            description: config.description[lang],
            scope: '/',
            start_url: isDefault ? '.' : `./${lang}`,
            display: config.display || 'browser',
            orientation: 'portrait',
            background_color: config.backgroundColor || "#ffffff",
            theme_color: config.themeColor || "#000000",
            icons: config.icons || []
        }

        const content = JSON.stringify(manifest, null, 2)

        mkdir(folders.dist.default)
        if(isDefault) {
            fs.writeFileSync(`${folders.dist.default}/manifest.json`, content)
        } else {
            mkdir(`${folders.dist.default}/${lang}`)
            fs.writeFileSync(`${folders.dist.default}/${lang}/manifest.json`, content)
        }
    })
}

module.exports = series(_cleanManifest, _createManifest)