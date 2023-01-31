import config from '../config'
import { folders, mkdir, clean } from './utils'
import * as fs from 'fs'

/**
 * Clean the manifest in dist folder
 * @returns NodeJS.ReadWriteStream
 */
export function cleanManifest(): NodeJS.ReadWriteStream {
    return clean(`${folders.dist.default}/**/manifest.json`)
}

/**
 * Create the manifest into the dist folder
 * Create one manifest for each language
 * @returns Promise<void>
 */
export async function generateManifest(next): Promise<void> {
    if(config.disableManifest) {
        return next()
    }

    config.languages.forEach(language => {
        const lang: string = typeof language === 'string' ? language : language.lang
        const isDefault: boolean = lang === config.defaultLanguage

        const manifest = {
            name: config.name[lang],
            short_name: config.shortName ? config.shortName[lang] : config.name[lang],
            description: config.description?.[lang] || '',
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