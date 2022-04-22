const { src, dest } = require('gulp')
const { clean, folders } = require("./utils")

function _cleanFonts() {
    return clean(folders.dist.fonts)
}
function _moveFonts() {
    return src(`${folders.src.fonts}/**/*`)
        .pipe(dest(folders.dist.fonts))
}

module.exports = {
    cleanFonts: _cleanFonts,
    moveFonts: _moveFonts
}
