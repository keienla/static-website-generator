export type TransitionKey = string | '*'
export type TransitionDirection = '=>' | '<=' | '<=>'
export type TransitionType = `${TransitionKey} ${TransitionDirection} ${TransitionKey}` | 'default'

export type TransitionFnIn = () => Promise<any>
export type TransitionFnOut = () => Promise<any>
