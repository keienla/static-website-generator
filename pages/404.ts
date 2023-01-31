import { I404Page } from './../src/interfaces/404.interface'
import PageCommon from './page-common'

const Page404: I404Page = {
    ...PageCommon,
    _template: '404',
    _nofollow: true,
    _noindex: true,

    head: {
        title: {
            fr: '404',
            en: '404',
        },
        description: {
            fr: 'Page introuvable',
            en: 'Not found',
        },
        keywords: {
            fr: '',
            en: '',
        },
    },
    content: {
        title: {
            fr: '404',
            en: '404',
        },
    },
    footer: {
        createdBy: {
            fr: 'Créé par',
            en: 'Created by',
        },
    },
}

export default Page404
