import { IBasePageArticle } from './../src/interfaces/base-page-article.interface';

const PageCommon: Pick<IBasePageArticle, 'main_content_link' | 'navigation'> = {
    main_content_link: {
        en: 'Main content',
        fr: 'Contenu principal',
    },

    navigation: [
        {
            href: {
                en: './en/index.html',
                fr: './index.html',
            },
            label: {
                en: 'Home',
                fr: 'Accueil',
            }
        }
    ]
}

export default PageCommon;