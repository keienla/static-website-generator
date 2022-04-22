const { clean, folders } = require("./utils");
const { src, dest } = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('./tsconfig.json')
const uglify = require('gulp-uglify')

function _cleanScripts() {
    return clean(folders.dist.script)
}

function _generateScripts() {
    return src(`${folders.src.script}/**/*.ts`)
        // init the sourcemaps
        .pipe(sourcemaps.init({loadMaps: true}))
        // compile to JS
        .pipe(tsProject()).js
        .pipe(uglify())
        // write sourcemaps
        .pipe(sourcemaps.write('./'))
        // send to destination
        .pipe(dest(folders.dist.script))
}

module.exports = {
    cleanScripts: _cleanScripts,
    generateScripts: _generateScripts
}
