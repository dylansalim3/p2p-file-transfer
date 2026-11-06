import {Reducer} from "redux";
import {PeerAction, PeerActionType, PeerState} from "./peerTypes";

export const initialState: PeerState = {
    id: undefined,
    loading: false,
    started: false,
    displayName: '',
}

export const PeerReducer: Reducer<PeerState, PeerAction> = (state = initialState, action) => {
    switch (action.type) {
        case PeerActionType.PEER_SESSION_START:
            const { id } = action
            return { ...state, id, started: true }
        case PeerActionType.PEER_SESSION_STOP:
            return { ...initialState }
        case PeerActionType.PEER_LOADING:
            const { loading } = action
            return { ...state, loading }
        case PeerActionType.PEER_NAME_CHANGE:
            return { ...state, displayName: action.name }
        default:
            return state
    }
}