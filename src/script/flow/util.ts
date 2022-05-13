/**
 *
 */
const DOM_PARSER: DOMParser = new window.DOMParser()

/**
 * Parse the html string and return a document
 * @param  {string} html
 * @returns Document
 */
export function getParsedHTML(html: string): Document {
    return DOM_PARSER.parseFromString(html, 'text/html')
}

/**
 * Extract the template name of the given document if there is one
 * To add one add 'data-template' attribute with a value to the body
 * @param  {Document} html
 * @returns string
 */
export function getTemplateName(html: Document): string | null {
    return html.body.getAttribute('data-template') || null
}

/**
 * Check if the given HTMLElement have the 'target-template' attribute
 * If true return it's value
 * @param  {HTMLElement|null} el
 * @returns string
 */
export function getTargetTemplateName(el: HTMLElement | null): string {
    if (el && el.hasAttribute('target-template')) return el.getAttribute('target-template') || ''
    return ''
}

/**
 * Get the URL of the current window locaction
 * @returns URL
 */
export function getCurrentURL(): URL | null {
    return transformToURL(window.location.href)
}

/**
 * Transform a given string to URL Element if possible
 * If there is no origin, will take the parameter origin and if not set will use as reference the current page url
 * @param  {string|null} url
 * @param  {string} origin?
 * @returns URL
 */
export function transformToURL(url: string | null, origin?: string): URL | null {
    if (url === null) return null

    try {
        return new URL(url)
    } catch (err) {
        try {
            return new URL(url, origin || window.location.href)
        } catch (e) {
            return null
        }
    }
}

/**
 * Check if two given url have the same origin
 * @param  {URL|null} url1
 * @param  {URL|null} url2
 * @returns boolean
 */
export function isSameOrigin(url1: URL | null, url2: URL | null): boolean {
    return isURL(url1) && isURL(url2) && url1.origin === url2.origin
}

/**
 * Check if the two urls exist and if the paths are same
 * @param  {URL|null} url1
 * @param  {URL|null} url2
 * @returns boolean
 */
export function isSamePath(url1: URL | null, url2: URL | null): boolean {
    return (
        isURL(url1) && isURL(url2) && url1.pathname === url2.pathname && url1.search === url2.search
    )
}

/**
 * Check if the given element exist and is instance of URL
 * @param  {URL|null} url
 * @returns boolean
 */
export function isURL(url: URL | null): url is URL {
    return !!url && url instanceof URL
}
