const { folders, config } = require('./gulp/utils')
const { src, parallel, watch, series } = require('gulp')

const webserver = require('gulp-webserver')

const createRobot = require('./gulp/robots')
const moveFonts = require('./gulp/fonts')
const generateScript = require('./gulp/typescript')
const generateStyle = require('./gulp/sass')
const compressImages = require('./gulp/images')
const createSitemap = require('./gulp/sitemap')
const generateViews = require('./gulp/views')
const generateManifest = require('./gulp/manifest')
const generateSW = require('./gulp/sw')

exports['build:fonts'] = moveFonts
exports['build:robot'] = createRobot
exports['build:ts'] = generateScript
exports['build:sass'] = generateStyle
exports['build:images'] = compressImages
exports['build:sitemap'] = createSitemap
exports['build:views'] = generateViews
exports['build:manifest'] = generateManifest
exports['build:sw'] = generateSW

const building = series(parallel(
    generateStyle,
    generateScript,
    generateViews,
    compressImages,
    moveFonts,
    createRobot,
    createSitemap,
    generateManifest,
), generateSW)

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

        watch([`${folders.pages}/**/*`, `${folders.src.default}/**/*.pug`], {events: 'all'}, parallel(generateViews, createRobot, createSitemap))
        watch(`${folders.src.style}/**/*.scss`, {events: 'all'}, generateStyle)
        watch(`${folders.src.script}/**/*.ts`, {events: 'all'}, generateScript)
        watch(`${folders.src.images}/**/*`, {events: 'all'}, compressImages)
        watch(`${folders.src.fonts}/**/*`, {events: 'all'}, moveFonts)
    })
}