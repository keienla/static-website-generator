const { folders, config, clean } = require('./gulp/utils')
const { src, parallel, watch, series } = require('gulp')
const wait = require('gulp-wait')

const webserver = require('gulp-webserver')

const {cleanFonts, moveFonts} = require('./gulp/fonts')
const {cleanImages, generateImages} = require('./gulp/images')
const {cleanManifest, generateManifest} = require('./gulp/manifest')
const {cleanRobots, generateRobots} = require('./gulp/robots')
const {cleanScripts, generateScripts} = require('./gulp/scripts')
const {cleanSitemap, generateSitemap} = require('./gulp/sitemap')
const {cleanStyles, generateStyles} = require('./gulp/styles')
const {cleanJSViews, cleanViews, generateJSViews, generateViews} = require('./gulp/views')
const {cleanSW, generateSW} = require('./gulp/sw')

function _cleanAll() {
    return clean([folders.dist.default, folders.tmp.default])
}

const fonts = series(cleanFonts, moveFonts)
exports['build:fonts'] = fonts

const images = series(cleanImages, generateImages)
exports['build:images'] = images

const manifest = series(cleanManifest, generateManifest)
exports['build:manifest'] = manifest

const robots = series(cleanRobots, generateRobots)
exports['build:robots'] = robots

const scripts = series(cleanScripts, generateScripts)
exports['build:scripts'] = scripts

const sitemap = series(cleanSitemap, generateSitemap)
exports['build:sitemap'] = sitemap

const styles = series(cleanStyles, generateStyles)
exports['build:styles'] = styles

const sw = series(cleanSW, generateSW)
exports['build:sw'] = sw

const viewsJS = series(cleanJSViews, generateJSViews)
exports['build:views:js'] = viewsJS

const views = series(viewsJS, cleanViews, generateViews)
exports['build:views'] = views

async function _fnWait() {
    return src('./gulpfile.js').pipe(wait(1000))
}

const building = series(
    _cleanAll,
    generateJSViews,
    _fnWait,
    parallel(
        moveFonts,
        generateImages,
        generateManifest,
        generateRobots,
        generateScripts,
        generateSitemap,
        generateStyles,
        generateViews,
    ),
    generateSW
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
            https: config.https
        }))

        watch(`${folders.src.fonts}/**/*`, {events: 'all'}, fonts)
        watch(`${folders.src.images}/**/*`, {events: 'all'}, images)
        watch(`${folders.src.style}/**/*.scss`, {events: 'all'}, styles)
        watch(`${folders.src.script}/**/*.ts`, {events: 'all'}, scripts)
        watch([`${folders.pages}/**/*`, `${folders.src.default}/**/*.pug`], {events: 'all'}, series(cleanJSViews, generateJSViews, parallel(manifest, robots, sitemap, generateViews)))
    })
}