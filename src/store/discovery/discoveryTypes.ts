import type { Via } from '../../helpers/transport'

export interface DiscoveredPeer {
    peerId: string
    name: string
    via: Via
    roomId: string
}

export interface ConnectionRequest {
    peerId: string
    name: string
}

export interface DiscoveryState {
    readonly nearbyActive: boolean
    readonly nearbyLocating: boolean
    readonly nearbyError?: string
    readonly codeRoom?: string
    /** Peers seen in any joined room, not yet accepted. */
    readonly discovered: DiscoveredPeer[]
    /** Incoming connection requests awaiting an answer. */
    readonly incoming: ConnectionRequest[]
    /** Peer ids we have asked, awaiting their answer. */
    readonly outgoing: string[]
    /** Display names by peer id (kept for the session, even after a peer leaves). */
    readonly names: Record<string, string>
    /** An in-progress incoming file, if any. */
    readonly receiving?: { peerId: string; name: string; percent: number }
}

export enum DiscoveryActionType {
    DISCOVERY_PEER_FOUND = 'DISCOVERY_PEER_FOUND',
    DISCOVERY_PEER_GONE = 'DISCOVERY_PEER_GONE',
    DISCOVERY_PEER_NAMED = 'DISCOVERY_PEER_NAMED',
    DISCOVERY_REQUEST_INCOMING = 'DISCOVERY_REQUEST_INCOMING',
    DISCOVERY_REQUEST_SENT = 'DISCOVERY_REQUEST_SENT',
    DISCOVERY_REQUEST_ANSWERED = 'DISCOVERY_REQUEST_ANSWERED',
    DISCOVERY_NEARBY_LOCATING = 'DISCOVERY_NEARBY_LOCATING',
    DISCOVERY_NEARBY_ACTIVE = 'DISCOVERY_NEARBY_ACTIVE',
    DISCOVERY_NEARBY_ERROR = 'DISCOVERY_NEARBY_ERROR',
    DISCOVERY_CODE_JOINED = 'DISCOVERY_CODE_JOINED',
    DISCOVERY_RECEIVING = 'DISCOVERY_RECEIVING',
    DISCOVERY_RECEIVING_DONE = 'DISCOVERY_RECEIVING_DONE',
    DISCOVERY_RESET = 'DISCOVERY_RESET',
}

export type DiscoveryAction =
    | { type: DiscoveryActionType.DISCOVERY_PEER_FOUND; peer: DiscoveredPeer }
    | { type: DiscoveryActionType.DISCOVERY_PEER_GONE; peerId: string }
    | { type: DiscoveryActionType.DISCOVERY_PEER_NAMED; peerId: string; name: string; roomId: string; via: Via }
    | { type: DiscoveryActionType.DISCOVERY_REQUEST_INCOMING; peerId: string; name: string }
    | { type: DiscoveryActionType.DISCOVERY_REQUEST_SENT; peerId: string }
    | { type: DiscoveryActionType.DISCOVERY_REQUEST_ANSWERED; peerId: string }
    | { type: DiscoveryActionType.DISCOVERY_NEARBY_LOCATING; locating: boolean }
    | { type: DiscoveryActionType.DISCOVERY_NEARBY_ACTIVE }
    | { type: DiscoveryActionType.DISCOVERY_NEARBY_ERROR; message: string }
    | { type: DiscoveryActionType.DISCOVERY_CODE_JOINED; code: string }
    | { type: DiscoveryActionType.DISCOVERY_RECEIVING; peerId: string; name: string; percent: number }
    | { type: DiscoveryActionType.DISCOVERY_RECEIVING_DONE }
    | { type: DiscoveryActionType.DISCOVERY_RESET }
