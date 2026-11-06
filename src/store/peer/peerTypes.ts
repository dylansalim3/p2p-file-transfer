export enum PeerActionType {
    PEER_SESSION_START = 'PEER_SESSION_START',
    PEER_SESSION_STOP = 'PEER_SESSION_STOP',
    PEER_LOADING = 'PEER_LOADING'
}

export type PeerAction =
    | { type: PeerActionType.PEER_SESSION_START; id: string }
    | { type: PeerActionType.PEER_SESSION_STOP }
    | { type: PeerActionType.PEER_LOADING; loading: boolean }

export interface PeerState {
    readonly id?: string
    readonly loading: boolean
    readonly started: boolean
}