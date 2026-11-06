import { Reducer } from 'redux'
import { DiscoveryAction, DiscoveryActionType, DiscoveryState } from './discoveryTypes'

export const initialState: DiscoveryState = {
    nearbyActive: false,
    nearbyLocating: false,
    nearbyError: undefined,
    codeRoom: undefined,
    discovered: [],
    incoming: [],
    outgoing: [],
    names: {},
    receiving: undefined,
}

export const DiscoveryReducer: Reducer<DiscoveryState, DiscoveryAction> = (
    state = initialState,
    action,
) => {
    switch (action.type) {
        case DiscoveryActionType.DISCOVERY_PEER_FOUND: {
            const { peer } = action
            if (state.discovered.some((p) => p.peerId === peer.peerId)) {
                return state
            }
            return { ...state, discovered: [...state.discovered, peer] }
        }
        case DiscoveryActionType.DISCOVERY_PEER_GONE: {
            return {
                ...state,
                discovered: state.discovered.filter((p) => p.peerId !== action.peerId),
            }
        }
        case DiscoveryActionType.DISCOVERY_PEER_NAMED: {
            const { peerId, name, roomId, via } = action
            const names = { ...state.names, [peerId]: name }
            const existing = state.discovered.find((p) => p.peerId === peerId)
            if (!existing) {
                return {
                    ...state,
                    names,
                    discovered: [...state.discovered, { peerId, name, roomId, via }],
                }
            }
            if (existing.name === name) {
                return { ...state, names }
            }
            return {
                ...state,
                names,
                discovered: state.discovered.map((p) => (p.peerId === peerId ? { ...p, name } : p)),
            }
        }
        case DiscoveryActionType.DISCOVERY_REQUEST_INCOMING: {
            const { peerId, name } = action
            if (state.incoming.some((r) => r.peerId === peerId)) {
                return state
            }
            return { ...state, incoming: [...state.incoming, { peerId, name }] }
        }
        case DiscoveryActionType.DISCOVERY_REQUEST_SENT: {
            if (state.outgoing.includes(action.peerId)) {
                return state
            }
            return { ...state, outgoing: [...state.outgoing, action.peerId] }
        }
        case DiscoveryActionType.DISCOVERY_REQUEST_ANSWERED: {
            const { peerId } = action
            return {
                ...state,
                incoming: state.incoming.filter((r) => r.peerId !== peerId),
                outgoing: state.outgoing.filter((id) => id !== peerId),
            }
        }
        case DiscoveryActionType.DISCOVERY_NEARBY_LOCATING: {
            return { ...state, nearbyLocating: action.locating }
        }
        case DiscoveryActionType.DISCOVERY_NEARBY_ACTIVE: {
            return { ...state, nearbyActive: true, nearbyLocating: false, nearbyError: undefined }
        }
        case DiscoveryActionType.DISCOVERY_NEARBY_ERROR: {
            return { ...state, nearbyLocating: false, nearbyError: action.message }
        }
        case DiscoveryActionType.DISCOVERY_CODE_JOINED: {
            return { ...state, codeRoom: action.code }
        }
        case DiscoveryActionType.DISCOVERY_RECEIVING: {
            return {
                ...state,
                receiving: { peerId: action.peerId, name: action.name, percent: action.percent },
            }
        }
        case DiscoveryActionType.DISCOVERY_RECEIVING_DONE: {
            return { ...state, receiving: undefined }
        }
        case DiscoveryActionType.DISCOVERY_RESET: {
            return initialState
        }
        default:
            return state
    }
}
