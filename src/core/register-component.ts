export interface IRegisterComponent {
    /**
     * The tag of the component
     * if value is 'my-component', so component will be call as '\<my-component />'
     */
    tag: string

    /**
     * It's the path to the html file of the component
     */
    template: string

    /**
     * It the paths to the styles of the component
     */
    styles?: string[]

    /**
     * The context that will be injected to the template
     * Can contain var, fn, ...
     */
    context?: object
}

function registerComponent({ tag, template, styles, context }: IRegisterComponent) {
    if (!tag) throw new Error('The key "tag" must be set while regestering a component')
}
