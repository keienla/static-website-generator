export type SrcImage = `/assets/img/${string}`|`http://${string}`|`https://${string}`|`data:image/${string}`

/**
 * The interface for alternatives images
 */
interface AlternativeIImage {
    /**
     * The type of the image
     * @type {`image/${string}`}
     */
    type?: `image/${string}`

    /**
     * A media request to select this image
     * @type {string}
     * @example
     * (min-width: 768px)
     */
    media?: string

    /**
     * The src of the alternative image
     * It's the url to get the image if this alternative is selected
     * @type {`/assets/img/${string}`|`http://${string}`|`https://${string}`}
     */
    srcset: SrcImage
}

/**
 * The interface of an image
 */
export interface IImage {
    /**
     * The description of the image
     * A good description is good for SEO
     * @type {Record<string, string>}
     */
    alt: Record<string, string>

    /**
     * The default link of the image
     * @type {`/assets/img/${string}`|`http://${string}`|`https://${string}`}
     * @example
     * // if external = false
     * /assets/img/my-image.jpg
     * // if external = true
     * https://other-website.com/my-image.jpg
     */
    src: SrcImage

    /**
     * The alternatives images for this picture
     * Is used to load a smallest image for mobile or another format if navigator can handle it
     *
     * The alternatives images media attribute must be in a specific order in depend of the media
     * @type {AlternativeIImage[]}
     * @example
     * // Good order because min-width 800px is before min-width 600px
     * // If other order the min-width 600px will always be selected before min-width 800px so the secondary element will never be shown
     * [
     *  {
     *     media: "(min-width: 800px)",
     *     srcset: "https://example.com/image-medium.jpg"
     *  }
     *  {
     *     media: "(min-width: 600px)",
     *     srcset: "https://example.com/image-small.jpg"
     *  }
     * ]
     */
    alternatives?: AlternativeIImage[]
}