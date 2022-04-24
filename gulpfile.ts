import config from "./config"
import { folders, clean } from './gulp/utils'
import { src, parallel, watch, series } from 'gulp'

import webserver from 'gulp-webserver'

import {cleanFonts, moveFonts} from './gulp/fonts'
import {cleanImages, generateImages} from './gulp/images'
import {cleanManifest, generateManifest} from './gulp/manifest'
import {cleanRobots, generateRobots} from './gulp/robots'
import {cleanScripts, generateScripts} from './gulp/scripts'
import {cleanSitemap, generateSitemap} from './gulp/sitemap'
import {cleanStyles, generateStyles} from './gulp/styles'
import {cleanViews, generateViews} from './gulp/views'
import {cleanSW, generateSW} from './gulp/sw'

function _cleanAll() {
    return clean(folders.dist.default)
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

const views = series(cleanViews, generateViews)
exports['build:views'] = views

const building = series(
    _cleanAll,
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

        watch(`${folders.src.fonts}/**/*`, fonts)
        watch(`${folders.src.images}/**/*`, images)
        watch(`${folders.src.style}/**/*.scss`, styles)
        watch(`${folders.src.script}/**/*.ts`, scripts)
        watch([`${folders.pages}/**/*`, `${folders.src.default}/**/*.pug`], parallel(manifest, robots, sitemap, generateViews))
    })
}