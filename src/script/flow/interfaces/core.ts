export type State = 'error' | 'in' | 'out' | 'end'

export interface IProperties {
    document: Document
    content: HTMLElement
    template: string | null
}

export interface IStateOutEventConstructor extends EventInit {
    from: IProperties & { link: HTMLElement | null }
    to: Pick<IProperties, 'template'>
    url: URL | null
    link: HTMLElement | null
    transitionKey: string | null
}

export class StateOutEvent extends Event {
    from: IStateOutEventConstructor['from']
    to: IStateOutEventConstructor['to']
    url: IStateOutEventConstructor['url']
    link: IStateOutEventConstructor['link']
    transitionKey: IStateOutEventConstructor['transitionKey']

    constructor(init: IStateOutEventConstructor) {
        super('out')

        this.from = init.from
        this.to = init.to
        this.url = init.url
        this.link = init.link
        this.transitionKey = init.transitionKey
    }
}

export interface IStateInEventConstructor extends EventInit {
    from: IProperties & { link: HTMLElement | null }
    to: IProperties
    url: URL | null
    link: HTMLElement | null
    transitionKey: string | null
}

export class StateInEvent extends Event {
    from: IStateInEventConstructor['from']
    to: IStateInEventConstructor['to']
    url: IStateInEventConstructor['url']
    link: IStateInEventConstructor['link']
    transitionKey: IStateInEventConstructor['transitionKey']

    constructor(init: IStateInEventConstructor) {
        super('out')

        this.from = init.from
        this.to = init.to
        this.url = init.url
        this.link = init.link
        this.transitionKey = init.transitionKey
    }
}

export interface IStateEndEventConstructor extends IStateInEventConstructor {}

export class StateEndEvent extends Event {
    from: IStateEndEventConstructor['from']
    to: IStateEndEventConstructor['to']
    url: IStateEndEventConstructor['url']
    link: IStateEndEventConstructor['link']
    transitionKey: IStateEndEventConstructor['transitionKey']

    constructor(init: IStateEndEventConstructor) {
        super('end')

        this.from = init.from
        this.to = init.to
        this.url = init.url
        this.link = init.link
        this.transitionKey = init.transitionKey
    }
}
