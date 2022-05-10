import { folders } from './gulp/utils'

// https://purgecss.com/configuration.html

export default {
    content: [
        `${folders.src.script}/**/*.ts`,
        `${folders.pages}/**/*.ts`,
        `${folders.src.views}/**/*.pug`
    ],
    defaultExtractor: (content) =>
        // default is /[a-zA-Z0-9_-]+/g
        // add ([a-zA-Z0-9_-]+\:)? at start to get all the class that are like spacename:name-of-class
        content.match(/(([a-zA-Z0-9_-]+\:)|\:)?[a-zA-Z0-9_-]+/g) || [],
}