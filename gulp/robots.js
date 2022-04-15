const { clean, folders, findFollowedNofollowedPages, baseUrl, mkdir } = require("./utils")
const { series } = require('gulp')
const fs = require('fs')

function _cleanRobot() {
    return clean(`${folders.dist.default}/robots.txt`)
}

async function _createRobot() {
    const {nofollowedPages, noindexedPages} = await findFollowedNofollowedPages()
    // To noindex have to use meta(name="robots") and don't put the element in the robots.txt file
    // ? https://developers.google.com/search/docs/advanced/crawling/block-indexing
    const disallowContent = nofollowedPages.filter(page => !noindexedPages.find(p => p.url === page.url)).map(({url}) => {
        return `Disallow: ${url}`
    }).join('\n')
    const robotContent =
`User-agent: *
Allow: /
${disallowContent}
Sitemap: ${baseUrl}/sitemap.xml`
    mkdir(folders.dist.default)
    fs.writeFileSync(`${folders.dist.default}/robots.txt`, robotContent)
}

module.exports = series(_cleanRobot, _createRobot)