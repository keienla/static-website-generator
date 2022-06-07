import { IStateInEventConstructor, IStateOutEventConstructor } from './core'

export type TransitionKey = string | '*'
export type TransitionDirection = '=>' | '<=' | '<=>'
export type TransitionType = `${TransitionKey} ${TransitionDirection} ${TransitionKey}`

export type TransitionFnIn = (params: IStateInEventConstructor) => Promise<any>
export type TransitionFnOut = (params: IStateOutEventConstructor) => Promise<any>

export interface ITransition {
    in: TransitionFnIn
    out: TransitionFnOut
}
