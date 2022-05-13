import { TransitionFnIn, TransitionFnOut, TransitionType } from './interfaces/transitions.js'
import {
    getCurrentURL,
    getTargetTemplateName,
    getTemplateName,
    isSameOrigin,
    isSamePath,
    transformToURL,
} from './util.js'

const CACHE: Record<string, Promise<Response>> = {}

let links: HTMLAnchorElement[] = []

const FLOW_CORE: {
    previousTemplate: string | null
    transitions: Record<TransitionType, { in: TransitionFnIn; out: TransitionFnOut }>
} = {
    previousTemplate: null,
    transitions: {
        default: {
            in: () => Promise.resolve(),
            out: () => Promise.resolve(),
        },
    },
}

/**
 * Initialize the event for the flow
 */
export function init() {
    window.onload = () => {
        selectLinksAndAddEvents()
        updateHistoryWithCurrentTemplate()
    }

    window.addEventListener('popstate', changePage)
    FLOW_CORE.previousTemplate = getTemplateName(document)
}

/**
 * Add a transition to the flow
 * @param  {TransitionType} key
 * @param  {TransitionFnIn} transitionIn
 * @param  {TransitionFnOut} transitionOut
 */
export function setTransition(
    key: TransitionType,
    transitionIn: TransitionFnIn,
    transitionOut: TransitionFnOut
) {
    FLOW_CORE.transitions[key] = { in: transitionIn, out: transitionOut }
}

/**
 * Ask to flow to change page
 * It will occur if the given url is not the same as the current url
 *
 * If an Event is passed, will prevent the default behavior of the event and stop the propagation
 * @param  {URL|null} url
 * @param  {MouseEvent} event?
 */
export function goToPage(url: URL | null, template?: string, event?: MouseEvent) {
    const currentURL = getCurrentURL()

    if (isSameOrigin(url, currentURL)) {
        if (event) {
            event.preventDefault()
            event.stopPropagation()
        }

        if (!isSamePath(url, currentURL)) {
            history.pushState({ template }, '', (url as URL).href)
            changePage({ state: { template } })
        }
    }
}

/**
 * When click on a link make the transition if possible
 * i.e if the link is in the same origin and not the same path
 * @param  {MouseEvent} event
 */
function clickLink(event: MouseEvent) {
    const a: HTMLElement | null = event.target as HTMLElement

    if (!!a) {
        const aURL = transformToURL(a.getAttribute('href'))
        const targetTemplate: string = getTargetTemplateName(a)
        const aTarget = a.getAttribute('target')

        if (aTarget !== '_blank') {
            goToPage(aURL, targetTemplate, event)
        }
    }
}

/**
 * If over a link with the same origin that the website
 * Preload the page like this if click on it the loading will be faster
 * @param  {MouseEvent} event
 */
function enterLink(event: MouseEvent): void {
    const a: HTMLElement | null = event.target as HTMLElement

    if (a) {
        const currentURL = getCurrentURL()
        const aURL = transformToURL(a.getAttribute('href'))
        const aTarget = a.getAttribute('target')

        if (
            aTarget !== '_blank' &&
            isSameOrigin(aURL, currentURL) &&
            !isSamePath(aURL, currentURL)
        ) {
            loadPage(aURL)
        }
    }
}

function changePage({ state }: { state?: { template?: string } }) {
    const currentTemplate = getTemplateName(document)
    const targetTemplate = state?.template || null

    // TODO HERE see how to do the animations/loading/updating content

    CACHE[window.location.href]
        .then((response) => {
            console.log(response)
        })
        .catch((err) => {})
    const currentURL: URL = new URL(window.location.href)
}

/**
 * if the URL is correct, load the page and cache the request in case of user want to return in the page
 * @param  {URL|null} url
 * @returns Promise<Response>
 */
function loadPage(url: URL | null): Promise<Response> {
    if (!url) return Promise.reject()
    if (url.href in CACHE) return CACHE[url.href]

    CACHE[url.href] = fetch(url.href, {
        mode: 'same-origin',
        method: 'GET',
        headers: { 'X-Requested-With': 'self-navigation' },
        credentials: 'same-origin',
    })

    return CACHE[url.href]
}

/**
 * If there is links in the var
 * Clear the event of click/mouseenter on it
 * Then select all links in the page and add the event of click and mouseenter
 */
function selectLinksAndAddEvents() {
    links.forEach((link) => {
        link.removeEventListener('click', clickLink)
        link.removeEventListener('mouseenter', enterLink)
    })

    links = Array.from(document.querySelectorAll('a'))

    if (links) {
        links.forEach((link) => {
            link.addEventListener('click', clickLink)
            link.addEventListener('mouseenter', enterLink)
        })
    }
}

/**
 * Search in the current page the template name
 * and replace in history the state param with template
 * to do the transition if go back/forward
 */
function updateHistoryWithCurrentTemplate() {
    const currentURL = getCurrentURL()
    const currentTemplate = getTemplateName(document)
    history.replaceState({ template: currentTemplate }, '', currentURL?.href)
}
