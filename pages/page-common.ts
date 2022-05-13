import { IBasePageArticle } from './../src/interfaces/base-page-article.interface'

const PageCommon: Pick<
    IBasePageArticle,
    'main_content_link' | 'navigation' | 'language_navigation'
> = {
    main_content_link: {
        en: 'Main content',
        fr: 'Contenu principal',
    },

    navigation: [
        {
            href: '/',
            label: {
                en: 'Home',
                fr: 'Accueil',
            },
            targetTemplate: 'home',
        },
        {
            href: '/404.html',
            label: {
                en: '404',
                fr: '404',
            },
            targetTemplate: '404',
        },
    ],

    language_navigation: {
        en: {
            label: 'English',
            flag: {
                alt: {
                    en: '',
                    fr: '',
                },
                src: '/assets/img/flags/gb.svg',
            },
        },
        fr: {
            label: 'Français',
            flag: {
                alt: {
                    en: '',
                    fr: '',
                },
                src: '/assets/img/flags/fr.svg',
            },
        },
    },
}

export default PageCommon
