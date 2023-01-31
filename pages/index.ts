import { IHomePage } from './../src/interfaces/home.interface';
import PageCommon from './page-common'

const HomePage: IHomePage = {
    ...PageCommon,
    "_template": "home",
    "_priority": 1.0,
    "head": {
        "title": {
            "fr": "Site static",
            "en": "Static Website"
        },
        "description": {
            "fr": "Un petit site utilisé comme base pour créer des sites internets statics",
            "en": "A small static website used as a base to create internet static websites"
        },
        "keywords": {
            "fr": "",
            "en": ""
        }
    },
    "content": {
        "title": {
            "fr": "Site <u>Static</u>",
            "en": "<u>Static</u> Website"
        }
    },
    "footer": {
        "createdBy": {
            "fr": "Créé par",
            "en": "Created by"
        }
    },
    "images": {}
}

export default HomePage