const { clean, folders } = require("./utils");
const { src, dest, series } = require('gulp')
const gulpImageMin = import('gulp-imagemin')
const webp = require('gulp-webp')

function _cleanCompressed() {
    return clean(folders.dist.images)
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

module.exports = series(_cleanCompressed, _transformToWebPImages, _moveImages, _compressImages);
