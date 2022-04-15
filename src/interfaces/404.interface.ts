import { IBasePageArticle } from "./base-page-article.interface"
import { Translation } from "./translation.interface"

/**
 * The default interface of a page
 * It contains the basics informations of it
 */
export interface I404Page extends IBasePageArticle {
    "content": {
        "title": Translation
    },
    "footer": {
        "createdBy": Translation
    }
}