const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const {src, dest, series, parallel, watch} = require('gulp')

const gulpClean = require('gulp-clean')
const replace = require('gulp-replace')

const pug = require('gulp-pug')
const gulpSass = require('gulp-dart-sass')
gulpSass.compiler = require('sass')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const gulpImageMin = import('gulp-imagemin')
const webp = require('gulp-webp')

const webserver = require('gulp-webserver')

const folders = {
    src: {
        default: './src',
        get views() { return `${this.default}/pages` },
        get style() { return `${this.default}/style` },
        get script() { return `${this.default}/script` },
        get images() { return `${this.default}/img` },
        get fonts() { return `${this.default}/fonts` },
        get translations() { return `${this.default}/branding-i18n` },
    },
    dist: {
        default: './dist',
        get views() { return `${this.default}/pages` },
        get style() { return `${this.default}/style` },
        get script() { return `${this.default}/script` },
        get images() { return `${this.default}/img` },
        get fonts() { return `${this.default}/fonts` },
        get translations() { return `${this.default}/branding-i18n` }
    },
}

// #region PUG
function _getData(src) {
    try {
        const stats = fs.statSync(src)

        if(stats.isDirectory()) {
            const els = fs.readdirSync(src)
            if(els.length) {
                const response = els.reduce((acc, fileFolder) => {
                    return _.merge(acc, _getData(src + '/' + fileFolder))
                }, {})
                return response
            }
        } else if(stats.isFile()) {
            const extension = path.extname(src);
            if(extension === '.json') {
                const folders = src.split('/').splice(2)
                folders[folders.length - 1] = folders[folders.length - 1].slice(0, folders[folders.length - 1].length - extension.length)
                const response = {}
                let current = response
                folders.forEach((folder, index) => {
                    if(index === folders.length - 1) {
                        current[folder] = JSON.parse(fs.readFileSync(src))
                    } else {
                        current[folder] = {}
                        current = current[folder]
                    }
                })

                return response
            }
        }
        return {}
    } catch(err) {
        return {}
    }
}
function _cleanDistViews() {
    return src([folders.dist.views, `${folders.dist}/index.html`], { read: false, allowEmpty: true }).pipe(gulpClean({force: true}))
}
function _compileViews(srcPath, distPath) {
    return function _compileView() {
        const data = _getData('./i18n');

        return src(srcPath, {allowEmpty: true})
            .pipe(pug({
                doctype: 'html',
                pretty: false,
                locals: data,
                basedir: folders.src.default,
                cache: false
            }))
            .pipe(replace(/\.s[ac]ss/g, '.css', {}))
            .pipe(replace(/\.tsx?/g, '.js'))
            .pipe(dest(distPath))
    }
}
const generateViews = series(
    _cleanDistViews,
    _compileViews(`${folders.src.views}/*.pug`, `${folders.dist.views}`),
    _compileViews(`${folders.src.default}/index.pug`, `${folders.dist.default}`)
)
exports['build:views'] = generateViews
// #endregion PUG

// #region SASS
function _cleanDistStyleFolder() {
    return src(folders.dist.style, {read: false, allowEmpty: true}).pipe(gulpClean({force: true}))
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
const generateStyle = series(_cleanDistStyleFolder, _compileStyle);

exports['build:sass'] = generateStyle
exports['watch:sass'] = function() {
    watch(`${folders.src.style}/**/*`, { events: 'all' }, generateStyle)
}
// #endregion

// #region TS
function _cleanDistScriptFolder() {
    return src(folders.dist.script, {read: false, allowEmpty: true}).pipe(gulpClean({force: true}))
}
function _compileScript() {
    return src(`${folders.src.script}/*.ts`)
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
const generateScript = series(_cleanDistScriptFolder, _compileScript);

exports['build:ts'] = generateScript
exports['watch:ts'] = function() {
    watch(`${folders.src.script}/**/*`, { events: 'all' }, generateScript)
}
// #endregion

// #region Compress Images
function _cleanCompressed() {
    return src(folders.dist.images, {read: false, allowEmpty: true}).pipe(gulpClean({force: true}))
}
// transform images to webp
const imageFormat = 'jpg,jpeg,png';
function _transformToWebPImages() {
    return src(`${folders.src.images}/**/*.{${imageFormat}}`)
        .pipe(webp())
        .pipe(dest(folders.dist.images))
}
function _moveImages() {
    return src([
        `${folders.src.images}/**/*`,
        // ...imageFormat.split(',').map(e => `!${folders.src.images}/**/*.${e}`)
    ])
        .pipe(dest(folders.dist.images))
}
// https://www.npmjs.com/package/gulp-imagemin to see options of gulp-imagemin
async function _compressImages() {
    return src(`${folders.dist.images}/**/*`)
        .pipe((await gulpImageMin).default())
        .pipe(dest(folders.dist.images))
}
const compressImages = series(_cleanCompressed, _transformToWebPImages, _moveImages, _compressImages);
exports['build:images'] = compressImages
// #endregion

// #region Move Fonts
function _cleanFonts() {
    return src(folders.dist.fonts, {read: false, allowEmpty: true}).pipe(gulpClean({force: true}))
}
function _moveFonts() {
    return src(`${folders.src.fonts}/**/*`)
        .pipe(dest(folders.dist.fonts))
}
const moveFonts = series(_cleanFonts, _moveFonts)
exports['build:fonts'] = moveFonts
// #endregion

const building = parallel(
    generateStyle,
    generateScript,
    generateViews,
    compressImages,
    moveFonts,
)

exports['build'] = building
exports.default = (cb) => {
    building(() => {
        src(folders.dist.default).pipe(webserver({
            livereload: true,
            directoryListing: false,
            open: true,
            host: 'localhost',
            port: 8080,
            path: '/',
        }))

        watch([`./i18n/**/*`, `${folders.src.default}/**/*.pug`], {events: 'all'}, generateViews)
        watch(`${folders.src.style}/**/*.scss`, {events: 'all'}, generateStyle)
        watch(`${folders.src.script}/**/*.ts`, {events: 'all'}, generateScript)
        watch(`${folders.src.images}/**/*`, {events: 'all'}, compressImages)
        watch(`${folders.src.fonts}/**/*`, {events: 'all'}, moveFonts)
    })
}