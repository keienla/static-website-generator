import { clean, folders } from './utils'
import { src, dest } from 'gulp'
import purgecss from 'gulp-purgecss'
const gulpSass = require('gulp-sass')
import * as dartSass from 'sass'
import * as sourcemaps from 'gulp-sourcemaps'
import purgecssOptions from './../purgecss.config'

const sass = gulpSass(dartSass)

/**
 * Clean the styles folder from the dist folder
 * @returns NodeJS.ReadWriteStream
 */
export function cleanStyles(): NodeJS.ReadWriteStream {
    return clean(folders.dist.style)
}

/**
 * Generate the styles inside the dist folder
 * @returns NodeJS.ReadWriteStream
 */
export function generateStyles(): NodeJS.ReadWriteStream {
    return src(`${folders.src.style}/*.scss`, {allowEmpty: true})
        // init the sourcemaps
        .pipe(sourcemaps.init())
        // compile to CSS
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ["./node_modules"]
            // fiber: Fiber
        }).on('error', sass.logError))
        .pipe(purgecss(purgecssOptions))
        // write sourcemaps
        .pipe(sourcemaps.write('./'))
        // send to destination
        .pipe(dest(folders.dist.style))
}