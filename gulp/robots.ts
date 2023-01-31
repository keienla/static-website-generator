import { clean, folders, findFollowedNofollowedPages, baseUrl, mkdir } from './utils'
import * as fs from 'fs'
import config from '../config'

/**
 * Clean the manifest in dist folder
 * @returns {NodeJS.ReadWriteStream}
 */
export function cleanRobots(): NodeJS.ReadWriteStream {
    return clean(`${folders.dist.default}/robots.txt`)
}

/**
 * Generate the robots.txt file for the website
 * @returns Promise
 */
export async function generateRobots(next): Promise<void> {
    if(config.disableRobots) {
        return next()
    }

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