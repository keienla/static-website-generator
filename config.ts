import { Config } from "./src/interfaces/config.interface"

const config: Config = {
    version: '1.0.0',

    https: false,
    prefix: "www",
    domain: "localhost",
    port: 8080,

    defaultLanguage: "fr",
    languages: [{dir: 'ltr', lang: "fr"}, "en"],

    name: {
        "fr": "Site Static",
        "en": "Static Site"
    },
    shortName: {
        "fr": "Site Static",
        "en": "Static Site"
    },
    description: {
        "fr": "Un petit site utilisé comme base pour créer des sites internets statics",
        "en": "A small static website used as a base to create internet statics websites"
    },
    backgroundColor: "#ffffff",
    themeColor: "#000000",
    display: "standalone",

    icons: []
}

export default config
