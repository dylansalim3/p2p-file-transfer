export enum ConnectionActionType {
    CONNECTION_INPUT_CHANGE = 'CONNECTION_INPUT_CHANGE',
    CONNECTION_CONNECT_LOADING = 'CONNECTION_CONNECT_LOADING',
    CONNECTION_LIST_ADD = 'CONNECTION_LIST_ADD',
    CONNECTION_LIST_REMOVE = 'CONNECTION_LIST_REMOVE',
    CONNECTION_ITEM_SELECT = 'CONNECTION_ITEM_SELECT'
}

export type ConnectionAction =
    | { type: ConnectionActionType.CONNECTION_INPUT_CHANGE; id: string }
    | { type: ConnectionActionType.CONNECTION_CONNECT_LOADING; loading: boolean }
    | { type: ConnectionActionType.CONNECTION_LIST_ADD; id: string }
    | { type: ConnectionActionType.CONNECTION_LIST_REMOVE; id: string }
    | { type: ConnectionActionType.CONNECTION_ITEM_SELECT; id: string }

export interface ConnectionState {
    readonly id?: string
    readonly loading: boolean
    readonly list: string[]
    readonly selectedId?: string
}