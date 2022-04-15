const { clean, folders, config, mkdir, getPathFiles, getFileName } = require("./utils")
const { series } = require('gulp')
const fs = require('fs')

const REGISTER_NAME = 'sw-register.js'
const SW_NAME = 'sw-default.js'

function _cleanSW() {
    return clean([
        `${folders.dist.default}/${REGISTER_NAME}`,
        `${folders.dist.default}/${SW_NAME}`
    ])
}

async function _createSwRegister(next) {
    if(!config.https) {
        console.warn('Must be HTTPS to register service worker')
        return next()
    }

    mkdir(folders.dist.default)

    const code =
`if(!!navigator?.serviceWorker) {
    navigator.serviceWorker
        .register('./${SW_NAME}')
        .catch(err => console.error('ServiceWorker registration failed: ', err))
}`

    fs.writeFileSync(`${folders.dist.default}/${REGISTER_NAME}`, code)
}

async function _createSw(next) {
    if(!config.https) {
        console.warn('Must be HTTPS to register service worker')
        return next()
    }

    mkdir(folders.dist.default)

    const HTML = getPathFiles(folders.dist.default, '.html')
    const JS = getPathFiles(folders.dist.script, '')
    const STYLE = getPathFiles(folders.dist.style, '')
    const ASSETS = getPathFiles(folders.dist.assets, '')

    const FILES = [...HTML, ...JS, ...STYLE, ...ASSETS]
        .filter(file => getFileName(file)?.extension !== 'map' ?? true)
        .map(file => '\'' + file.replace(folders.dist.default, '.') + '\'')

    const code =
`// The name of the cache
const CACHE_NAME = 'CACHE.V.${config.version || '1.0.0'}'
// The list of the files to cache
const FILES_TO_CACHE = [
    ${FILES.join(',\n    ')}
]

// Install the service worker and cache the files
selft?.addEventListener?.('install', event => {
    event.waitUntil((async () => {
        console.log('[Service Worker] Install')
        const cache = await caches?.open(CACHE_NAME)
        if(cache)
            cache.addAll(FILES_TO_CACHE)
    })())
})

// The service worker fetches content from the cache if it is available there, providing offline functionality
selft?.addEventListener?.('fetch', event => {
    event.respondWith((async () => {
        console.log(\`[Service Worker] Fetching resource: \${e.request.url}\`);
        const response = await caches.match(event.request)
        if(response) return response

        const fetchResponse = await fetch(event.request)
        const cache = await caches?.open(CACHE_NAME)

        if(event.request.method === 'GET' && cache) {
            cache.put(event.request, fetchResponse.clone())
        }

        return fetchResponse
    })())
})

self?.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const keys = await caches?.keys()

        if(keys?.length) {
            Promise.all(keys.map(key => {
                if(key !== CACHE_NAME) return caches.delete(key)
            }))
        }

        self.clients?.claim?.()
    })())
})
`
    fs.writeFileSync(`${folders.dist.default}/${SW_NAME}`, code)
}

module.exports = series(_cleanSW, _createSw, _createSwRegister)