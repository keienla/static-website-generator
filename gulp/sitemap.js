const { clean, findFollowedNofollowedPages, folders, config, constructPageUrl, mkdir, baseUrl } = require("./utils")
const fs = require('fs')
const { series } = require('gulp')

function _cleanSitemap() {
    return clean(`${folders.dist.default}/sitemap.xml`)
}

async function _createSitemap() {
    const followedPages = (await findFollowedNofollowedPages()).followedPages.map(({url, data, name, src}) => {
        let response = '<url>'
        // Set Url
        response += `<loc>${url}</loc>`
        // Set lastmod
        const lastMod = fs.statSync(src).mtime
        const year = lastMod.getFullYear()
        const month = lastMod.getMonth() + 1 < 10 ? `0${lastMod.getMonth() + 1}` : lastMod.getMonth() + 1
        const day = lastMod.getDate() < 10 ? `0${lastMod.getDate()}` : lastMod.getDate()
        response += `<lastmod>${year}-${month}-${day}</lastmod>`
        // set changefreq
        response += `<changefreq>${data._changefreq ? data._changefreq : "yearly"}</changefreq>`
        // set priority
        response += `<priority>${typeof data._priority === 'number' ? data._priority : "0.5"}</priority>`
        // Set images
        if(data.images && Object.keys(data.images).length) {
            response += Object.keys(data.images).map((key) => {
                const image = data.images[key]
                const external = /^https?\:\/\//g.test(image.src)
                return `<image:image><image:loc>${external ? image.src : baseUrl + (image.src[0] === '/' ? '' : '/') + image.src}</image:loc></image:image>`
            }).join('')
        }
        // Set Alternate urls
        response += config.languages.map(language => {
            const lang = typeof language.lang === 'string' ? language.lang : language
            return `<xhtml:link rel="alternate" hreflang="${lang}" href="${constructPageUrl(lang, name)}" />`
        }).join('\n')
        response += '</url>'
        return response
    })
    const sitemapContent =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${followedPages.join('\n')}
</urlset>`
    mkdir(folders.dist.default)
    fs.writeFileSync(`${folders.dist.default}/sitemap.xml`, sitemapContent)
}

module.exports = series(_cleanSitemap, _createSitemap)