const { clean, folders } = require("./utils");
const { src, dest, series, lastRun } = require('gulp')
const gulpSass = require('gulp-dart-sass')
gulpSass.compiler = require('sass')
const sourcemaps = require('gulp-sourcemaps')

function _cleanStyles() {
    return clean(folders.dist.style)
}
function _generateStyles() {
    return src(`${folders.src.style}/*.scss`, {allowEmpty: true, since: lastRun(_generateStyles)})
        // init the sourcemaps
        .pipe(sourcemaps.init())
        // compile to CSS
        .pipe(gulpSass({
            outputStyle: 'compressed',
            includePaths: ["./node_modules"]
            // fiber: Fiber
        }).on('error', gulpSass.logError))
        // write sourcemaps
        .pipe(sourcemaps.write('./'))
        // send to destination
        .pipe(dest(folders.dist.style))
}

module.exports = {
    cleanStyles: _cleanStyles,
    generateStyles: _generateStyles
}