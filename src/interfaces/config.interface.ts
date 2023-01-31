import { AdvancedLanguages, Languages, Translation } from "./translation.interface";

export interface Config {
    // The version for the cache system
    version?: string,

    // #region protocol
    /**
     * If the site is on https or no
     * If the website is not on https, the service worker cannot be build
     * @type {boolean|undefined}
     */
    "https"?: boolean,

    /**
     * The prefix of the domain
     * @type {string|undefined}
     * @example
     *  'www' | 'dev'
     */
    "prefix"?: string,

    /**
     * The domain of the site
     * @type {string}
     * @example
     *  'localhost' | 'my-website.com'
     */
    "domain": string,

    /**
     * The port of the site if specific
     * @type {number|undefined}
     * @example
     *  80 | 443
     */
    "port"?: number,
    // #endregion

    // #region disable non essential features
    /**
     * If set to true, the manifest for each language will not be build
     * @type {boolean}
     * @default false
     */
    "disableManifest"?: boolean

    /**
     * If set to true, the service worker will not be build
     * @type {boolean}
     * @default false
     */
    "disableServiceWorker"?: boolean

    /**
     * If set to true, the sitemap will not be build
     * @type {boolean}
     * @default false
     */
    "disableSitemap"?: boolean

    /**
     * If set to true, the robots will not be build
     * @type {boolean}
     * @default false
     */
    "disableRobots"?: boolean
    // #endregion disable non essential features

    // #region languages
    /**
     * The default language of the site.
     * Must be an element of "languages"
     */
    "defaultLanguage": Languages

    /**
     * The list of languages of the site
     * Each language must can be:
     *  - just a language subtag
     *  - a language subtag with a region subtag
     * @example
     *  ["fr", "en-US"]
     */
    "languages": (Languages | AdvancedLanguages)[]
    // #endregion

    // #region General
    /**
     * The name of the website. Can be anything
     * @type {string}
     */
    "name": Translation

    /**
     * The name reduced of the website
     * If not set, it will be the name of the website
     * @type {string|undefined}
     */
    "shortName"?: Translation

    /**
     * A general description of the full website
     * @type {string}
     */
    "description"?: Translation

    /**
     * The background color of the website
     * @type {string}
     * @example
     *  #ffffff
     */
    "backgroundColor"?: string

    /**
     * The theme color of the website
     * @type {string}
     * @example
     *  #ff0
     */
    "themeColor"?: string

    /**
     * Define the screen mode of the app.
     * @type {"standalone" | "fullscreen" | "minimal-ui" | "browser" | undefined}
     * @default "browser"
     */
    "display"?: "standalone" | "fullscreen" | "minimal-ui" | "browser"

    /**
     * Array of object representing the icons of the website
     *
     * Need at least three icons with :
     * - PNG, SVG or WebP
     * - 144px, 192px and 512px
     * - square format
     * - 144px with "purpose":"any"
     * @type {{"src": string,"sizes": string,"type"?: string, "purpose"?: string}[]}
     * @example
     * [
     *  {
     *      "src": "/assets/icons/icon-192x192.png",
     *      "sizes": "192x192",
     *      "type": "image/png"
     *  },
     *  {
     *      "src": "icon/hd_hi.ico",
     *      "sizes": "72x72 96x96 128x128 256x256"
     *      "type": "image/x-icon"
     *   },
     *   {
     *      "src": "icon/hd_hi.svg",
     *      "sizes": "any"
     *   }
     * ]
     */
    "icons": {
        // The path of the icon
        "src": `/assets/img/${string}`|`http://${string}`|`https://${string}`,
        // The size of the icon
        "sizes": string,
        // The type of the icon
        "type"?: string,
        // The purpose of the icon
        "purpose"?: "any" | "maskable" | "any-h" | "any-v" | "badge" | "logo" | "placeholder" | "any-h-v"
    }[]
    // #endregion
}