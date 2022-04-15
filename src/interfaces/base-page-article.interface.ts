import { IImage } from "./image.interface"
import { Translation } from "./translation.interface"

/**
 * The default interface of a page
 * It contains the basics informations of it
 */
export interface IBasePageArticle {
    /**
     * The name of the {_template}.pug file to use
     * If no template is specified, the page will not be generated
     * @type {string}
     */
    "_template": string

    /**
     * Tell to search engines approximately how ofter the page is updated
     * An update refers to actual changes to the HTML code or text of the page, not updated Flash content or modified images.
     * @type {"always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"}
     * @default "yearly"
     * @example
     * "always" // Stock market data, social bookmarking categories
     * "hourly" // Major news site, weather information, forum
     * "daily" // Blog entry index, classifieds, small message board
     * "weekly" // Product info pages, website directories
     * "monthly" // FAQs, instructions, occasionally updated articles
     * "yearly" // Contact, “About Us”, login, registration pages
     * "never" // Old news stories, press releases, etc
     */
    "_changefreq"?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"

    /**
     * Number between 0 and 1 that indicates how important the page is for the search engines.
     * @type {number}
     * @default 0.5
     * @example
     * 0.8-1.0 // Homepage, subdomains, product info, major features, major category pages.
     * 0.4-0.7 // Articles and blog entries, minor category pages, sub-category pages, FAQs
     * 0.0-0.3 // Outdated news, info that has become irrelevant
     */
    "_priority"?: number

    /**
     * Block the user-agent robots from exploring the page
     * @type {boolean|undefined}
     */
    "_nofollow"?: boolean

    /**
     * Block the user-agent robots from indexing the page
     * @type {boolean|undefined}
     */
    "_noindex"?: boolean      // If the robots can index the page

    /**
     * General informations of the page.
     * This will used to set the title, description and keywords meta tags
     */
    "head": {
        /**
         * The title of the page. This is used in the <title> tag
         * @type {Translation}
         */
        "title": Translation

        /**
         * The description of the page. This is used in the <meta description> tag
         * @type {Translation}
         */
        "description": Translation

        /**
         * The keywords of the page. This is used in the <meta keywords> tag
         * @type {Translation}
         */
        "keywords": Translation
    },

    /**
     * List of images used the page
     * All the images specified here will be referenced is the page is referenced
     * @type {Record<string, IImage>|undefined}
     */
    "images"?: Record<string, IImage>
}