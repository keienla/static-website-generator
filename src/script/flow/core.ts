import {
    IProperties,
    State,
    StateEndEvent,
    StateInEvent,
    StateOutEvent,
} from './interfaces/core.js'
import {
    ITransition,
    TransitionFnIn,
    TransitionFnOut,
    TransitionType,
} from './interfaces/transitions.js'
import {
    findTargetLink,
    getContent,
    getCurrentURL,
    getParsedHTML,
    getTargetTemplateName,
    getTemplateName,
    isSameOrigin,
    isSamePath,
    transformToURL,
} from './util.js'

const FETCHING: Record<string, Promise<Response>> = {}
const CACHE: Record<string, string> = {}

let links: HTMLAnchorElement[] = []

const FLOW_CORE: {
    previousTemplate: string | null
    transitions: Map<TransitionType | 'default' | 'reduced-motion', ITransition>
    state: State
} = {
    previousTemplate: null,
    transitions: new Map(),
    state: 'end',
}

const DEFAULT_TRANSITION: ITransition = {
    out: async (params) => {
        const animation = params.from.content.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 5000,
            iterations: 1,
            fill: 'forwards',
        })

        animation.play()
        return animation.finished
    },
    in: async (params) => {
        const animation = params.to.content.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 5000,
            iterations: 1,
            fill: 'forwards',
        })

        animation.play()
        return animation.finished
    },
}

setTransition('default', DEFAULT_TRANSITION.out, DEFAULT_TRANSITION.in)

setTransition('reduced-motion', DEFAULT_TRANSITION.out, DEFAULT_TRANSITION.in)

export const changeState = new EventTarget()

changeState.addEventListener('in', (event: StateInEvent) => {
    console.log('in', event, event.from, event.to, event.link)
})

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
    key: TransitionType | 'default' | 'reduced-motion',
    transitionOut: TransitionFnOut,
    transitionIn: TransitionFnIn
) {
    FLOW_CORE.transitions.set(key, { in: transitionIn, out: transitionOut })
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

    // If running can't change page
    if (FLOW_CORE.state !== 'end' && FLOW_CORE.state !== 'error') {
        if (event) {
            event.preventDefault()
        }
        return
    }

    if (isSameOrigin(url, currentURL) && (event ? !(event.metaKey || event.ctrlKey) : true)) {
        if (event) {
            event.preventDefault()
        }

        if (!isSamePath(url, currentURL)) {
            history.pushState({ template }, '', (url as URL).href)
            changePage(
                { state: { template } },
                event ? findTargetLink(event.target as HTMLElement) : null
            )
        }
    }
}

/**
 * When click on a link make the transition if possible
 * i.e if the link is in the same origin and not the same path
 * @param  {MouseEvent} event
 */
function clickLink(event: MouseEvent) {
    const a: HTMLElement | null = findTargetLink(event.target as HTMLElement)

    if (!!a) {
        const aURL = transformToURL(a.getAttribute('href'))
        const targetTemplate: string = getTargetTemplateName(a)

        goToPage(aURL, targetTemplate, event)
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
            try {
                fetchPage(aURL)
            } catch (err) {}
        }
    }
}

async function changePage(
    { state }: { state?: { template?: string } },
    link: HTMLElement | null = null
) {
    const currentTemplate = getTemplateName(document) || '*'
    const targetTemplate = state?.template || '*'

    const from: StateInEvent['from'] = {
        document: document,
        content: getContent(document),
        template: currentTemplate,
        link,
    }

    FLOW_CORE.state = 'out'

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return ''
    }

    const possibleTransitions: TransitionType[] = constructPossibleTransitions(
        currentTemplate,
        targetTemplate
    )

    const transitionKey =
        Array.from(FLOW_CORE.transitions.keys()).find((key) =>
            possibleTransitions.includes(key as TransitionType)
        ) || null
    const transition = matchMedia('(prefers-reduced-motion: reduce)').matches
        ? FLOW_CORE.transitions.get('reduced-motion') || DEFAULT_TRANSITION
        : transitionKey
        ? FLOW_CORE.transitions.get(transitionKey) ||
          FLOW_CORE.transitions.get('default') ||
          DEFAULT_TRANSITION
        : FLOW_CORE.transitions.get('default') || DEFAULT_TRANSITION

    changeState.dispatchEvent(
        new StateOutEvent({
            from,
            to: {
                template: targetTemplate,
            },
            url: getCurrentURL(),
            link,
            transitionKey,
        })
    )

    try {
        const [_out, html] = await Promise.all([
            transition.out({
                from,
                to: {
                    template: targetTemplate,
                },
                url: getCurrentURL(),
                link,
                transitionKey,
            }),
            fetchPage(getCurrentURL()),
        ])
        if (!html) {
            throw new Error('No html')
        }

        updateDOMForInTransitionPage(getParsedHTML(html))

        FLOW_CORE.state = 'in'
        changeState.dispatchEvent(
            new StateInEvent({
                from,
                to: {
                    document: document,
                    content: getContent(document),
                    template: currentTemplate,
                },
                url: getCurrentURL(),
                link,
                transitionKey,
            })
        )

        await transition.in({
            from,
            to: {
                document: document,
                content: getContent(document),
                template: currentTemplate,
            },
            url: getCurrentURL(),
            link,
            transitionKey,
        })

        deleteOldContent()

        FLOW_CORE.state = 'end'

        changeState.dispatchEvent(
            new StateEndEvent({
                from,
                to: {
                    document: document,
                    content: getContent(document),
                    template: currentTemplate,
                },
                url: getCurrentURL(),
                link,
                transitionKey,
            })
        )

        selectLinksAndAddEvents()
    } catch (err) {
        FLOW_CORE.state = 'end'
        // TODO Status error
        console.log(err)
    }
}

/**
 * if the URL is correct, load the page and cache the request in case of user want to return in the page
 * @param  {URL|null} url
 * @returns Promise<Response>
 */
async function fetchPage(url: URL | null): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        if (!url) return reject()
        if (url.href in CACHE) return resolve(CACHE[url.href])
        if (url.href in FETCHING) {
            try {
                await FETCHING[url.href]
                return resolve(CACHE[url.href])
            } catch (err) {
                return reject(err)
            }
        }

        try {
            FETCHING[url.href] = fetch(url.href, {
                mode: 'same-origin',
                method: 'GET',
                headers: { 'X-Requested-With': 'self-navigation' },
                credentials: 'same-origin',
            })

            const response = await FETCHING[url.href]
            const content = await response.text()
            if (response.status >= 200 && response.status < 300) {
                CACHE[url.href] = content
            }
            delete FETCHING[url.href]
            return resolve(content)
        } catch (err) {
            delete FETCHING[url.href]
            delete CACHE[url.href]
            return reject(err)
        }
    })
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

    links = Array.from(document.querySelectorAll('a:not([target]):not([data-flow-disabled])'))

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

function constructPossibleTransitions(
    currentTemplate: string,
    targetTemplate: string
): TransitionType[] {
    const response: TransitionType[] = [
        `${currentTemplate} => ${targetTemplate}`,
        `${targetTemplate} <= ${currentTemplate}`,
        `${currentTemplate} <=> ${targetTemplate}`,
        `${targetTemplate} <=> ${currentTemplate}`,
    ]

    if (currentTemplate !== '*') {
        response.push(...constructPossibleTransitions('*', targetTemplate))
    }
    if (targetTemplate !== '*') {
        response.push(...constructPossibleTransitions(currentTemplate, '*'))
    }
    if (currentTemplate !== '*' && targetTemplate !== '*') {
        response.push(...constructPossibleTransitions('*', '*'))
    }

    return response
}

function updateDOMForInTransitionPage(dom: Document) {
    updateTitle(dom)
    updateLang(dom)
    setNewContent(dom)
    updateTemplateName(dom)
}

/**
 * Replace the actual title with the title of the new page
 * @param  {Document} dom
 */
function updateTitle(dom: Document) {
    document.title = dom.title
}

/**
 * Replace the actual lang/dir of the page with the lang/dir of the new page
 * @param  {Document} dom
 */
function updateLang(dom: Document) {
    if (document.children[0].getAttribute('lang') !== dom.children[0].getAttribute('lang')) {
        document.children[0].setAttribute('lang', dom.children[0].getAttribute('lang') || 'en')
    }
    if (document.children[0].getAttribute('dir') !== dom.children[0].getAttribute('dir')) {
        document.children[0].setAttribute('dir', dom.children[0].getAttribute('dir') || 'ltr')
        document.dir = document.children[0].getAttribute('dir') || 'ltr'
    }
}

function setNewContent(dom: Document) {
    let currentContent = getContent(document)
    let newContent = getContent(dom)
    if (
        (currentContent.tagName === 'BODY' || newContent.tagName === 'BODY') &&
        currentContent.tagName !== newContent.tagName
    ) {
        if (currentContent.tagName !== 'BODY') currentContent = getContent(document, 'body')
        if (newContent.tagName !== 'BODY') newContent = getContent(dom, 'body')
    }

    // If the content bloc is not a relative element set the position
    const currentContentPositionStyle = window.getComputedStyle(currentContent).position
    if (currentContentPositionStyle === 'static') {
        currentContent.style.position = 'relative'
    }

    // Create the container for content that will disappear
    const container = document.createElement('div')
    container.setAttribute('data-flow-todo-remove', 'true')
    container.style.position = 'absolute'
    container.style.top = '0'
    container.style.left = '0'
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.padding = 'inherit'

    // Move the existing elements into the container
    const currentContentFragment = document.createDocumentFragment()
    currentContentFragment.appendChild(container)
    Array.from(currentContent.children).forEach((child) => {
        container.appendChild(child)
    })

    // Set the element of the new page into the content
    const newContentFragment = document.createDocumentFragment()
    Array.from(newContent.children).forEach((child) => {
        newContentFragment.appendChild(child)
    })

    currentContent.prepend(newContentFragment, currentContentFragment)
}

function updateTemplateName(dom: Document) {
    const template = getTemplateName(dom)
    const currentTemplate = getTemplateName(document)
    if (template !== currentTemplate) {
        document.documentElement.setAttribute('data-flow-template', template || '*')
    }
}

function deleteOldContent() {
    const todoRemove = document.querySelector('[data-flow-todo-remove]')
    todoRemove?.remove()

    const container = getContent(document)
    if (container.style.position === 'relative') {
        container.style.position = ''
    }
}
