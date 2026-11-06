export enum PeerActionType {
    PEER_SESSION_START = 'PEER_SESSION_START',
    PEER_SESSION_STOP = 'PEER_SESSION_STOP',
    PEER_LOADING = 'PEER_LOADING',
    PEER_NAME_CHANGE = 'PEER_NAME_CHANGE',
}

export type PeerAction =
    | { type: PeerActionType.PEER_SESSION_START; id: string }
    | { type: PeerActionType.PEER_SESSION_STOP }
    | { type: PeerActionType.PEER_LOADING; loading: boolean }
    | { type: PeerActionType.PEER_NAME_CHANGE; name: string }

export interface PeerState {
    readonly id?: string
    readonly loading: boolean
    readonly started: boolean
    readonly displayName: string
}