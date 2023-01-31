import { src, dest } from 'gulp'
import { clean, folders } from './utils'

/**
 * Clean the fonts from the dist folder
 * @returns NodeJS.ReadWriteStream
 */
export function cleanFonts(): NodeJS.ReadWriteStream {
    return clean(folders.dist.fonts)
}

/**
 * Move the fonts to the dist folder
 * @returns NodeJS.ReadWriteStream
 */
export function moveFonts(): NodeJS.ReadWriteStream {
    return src(`${folders.src.fonts}/**/*`)
        .pipe(dest(folders.dist.fonts))
}
