import { clean, folders } from './utils'
import { src, dest, series, TaskFunction } from 'gulp'
import gulpImageMin from 'gulp-imagemin'
import webp from 'gulp-webp'

const IMAGES_FORMATS = 'jpg,jpeg,png';

/**
 * Clean the fonts from the dist folder
 * @returns NodeJS.ReadWriteStream
 */
export function cleanImages(): NodeJS.ReadWriteStream {
    return clean(folders.dist.images)
}

/**
 * Transform the images into WebP format
 * @returns NodeJS.ReadWriteStream
 */
function _transformToWebPImages(): NodeJS.ReadWriteStream {
    return src(`${folders.src.images}/**/*.{${IMAGES_FORMATS}}`,  {allowEmpty: true})
        .pipe(webp())
        .pipe(dest(folders.dist.images))
}

/**
 * Move the images to the dist folder
 * @returns NodeJS.ReadWriteStream
 */
function _moveImages(): NodeJS.ReadWriteStream {
    return src([
        `${folders.src.images}/**/*`,
        // ...IMAGES_FORMATS.split(',').map(e => `!${folders.src.images}/**/*.${e}`)
    ])
        .pipe(dest(folders.dist.images))
}

/**
 * Compress the images
 * https://www.npmjs.com/package/gulp-imagemin to see options of gulp-imagemin
 * @returns Promise<NodeJS.ReadWriteStream>
 */
function _compressImages(): NodeJS.ReadWriteStream {
    return src(`${folders.dist.images}/**/*`)
        .pipe(gulpImageMin())
        .pipe(dest(folders.dist.images))
}

export const generateImages: TaskFunction = series(_transformToWebPImages, _moveImages, _compressImages)
