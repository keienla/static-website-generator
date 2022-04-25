import { clean, folders } from './utils'
import { src, dest } from 'gulp'
import sourcemaps from 'gulp-sourcemaps'
const uglify = require('gulp-uglify')
import typescript from 'typescript'
import through from 'through2'
import fs from 'fs'

const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8')
    // Remove the //... comments
    .replace(/\/\/.*/gm, '')
    // Remove the /* ... */ comments
    .replace(/\/\*.*\*\//gm, '')
    // remove the ',' if on the last element before closure
    .replace(/,\s*(\}|\])/gm, '}'))

/**
 * Log the info of the stream
 * @returns {NodeJS.ReadWriteStream}
 */
function transpile(): NodeJS.ReadWriteStream {
    return through.obj(async (file, enc, cb) => {
        const content = typescript.transpile(file.contents.toString(), tsconfig.compilerOptions || {})
        file.contents = Buffer.from(content, enc)
        file.extname = '.js'
        return cb(null, file)
    })
}

/**
 * Clean the scripts from the dist folder
 * @returns NodeJS.ReadWriteStream
 */
export function cleanScripts(): NodeJS.ReadWriteStream {
    return clean(folders.dist.script)
}

/**
 * Generate all the ts scripts to JS
 * @returns NodeJS.ReadWriteStream
 */
export function generateScripts(): NodeJS.ReadWriteStream {
    return src(`${folders.src.script}/**/*.ts`, {allowEmpty: true})
        // init the sourcemaps
        .pipe(sourcemaps.init({loadMaps: true}))
        // compile to JS
        // .pipe(ts()).js
        .pipe(transpile())
        .pipe(uglify())
        // write sourcemaps
        .pipe(sourcemaps.write('./'))
        // send to destination
        .pipe(dest(folders.dist.script))
}
