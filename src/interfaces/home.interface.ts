import { IBasePageArticle } from "./base-page-article.interface"
import { IImage } from "./image.interface"
import { Translation } from "./translation.interface"

/**
 * The default interface of a page
 * It contains the basics informations of it
 */
export interface IHomePage extends IBasePageArticle {
    "content": {
        "title": Translation
    },
    "footer": {
        "createdBy": Translation
    }
}