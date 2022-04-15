const { clean, folders } = require("./utils");
const { src, dest, series } = require('gulp')
const gulpSass = require('gulp-dart-sass')
gulpSass.compiler = require('sass')
const sourcemaps = require('gulp-sourcemaps')

function _cleanDistStyleFolder() {
    return clean(folders.dist.style)
}
function _compileStyle() {
    return src(`${folders.src.style}/*.scss`)
        // init the sourcemaps
        .pipe(sourcemaps.init())
        // compile to CSS
        .pipe(gulpSass({
            outputStyle: 'compressed',
            // fiber: Fiber
        }).on('error', gulpSass.logError))
        // write sourcemaps
        .pipe(sourcemaps.write('./'))
        // send to destination
        .pipe(dest(folders.dist.style))
}

module.exports = series(_cleanDistStyleFolder, _compileStyle);