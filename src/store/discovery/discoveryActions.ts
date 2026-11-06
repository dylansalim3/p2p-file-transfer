import { Dispatch } from 'redux'
import { message } from 'antd'
import { DiscoveryActionType, DiscoveredPeer } from './discoveryTypes'
import { Transport, codeRoomId } from '../../helpers/transport'
import type { Via } from '../../helpers/transport'
import { nearbyGeohashes } from '../../helpers/geohash'
import { addConnectionList } from '../connection/connectionActions'

// Plain actions — also used by the transport callbacks registered in
// peerActions, so the store stays the single source of truth for peers.
export const peerFound = (peer: DiscoveredPeer) => ({
    type: DiscoveryActionType.DISCOVERY_PEER_FOUND as const,
    peer,
})
export const peerGone = (peerId: string) => ({
    type: DiscoveryActionType.DISCOVERY_PEER_GONE as const,
    peerId,
})
export const peerNamed = (peerId: string, name: string, roomId: string, via: Via) => ({
    type: DiscoveryActionType.DISCOVERY_PEER_NAMED as const,
    peerId,
    name,
    roomId,
    via,
})
export const requestIncoming = (peerId: string, name: string) => ({
    type: DiscoveryActionType.DISCOVERY_REQUEST_INCOMING as const,
    peerId,
    name,
})
export const requestAnswered = (peerId: string) => ({
    type: DiscoveryActionType.DISCOVERY_REQUEST_ANSWERED as const,
    peerId,
})
export const receivingProgress = (peerId: string, name: string, percent: number) => ({
    type: DiscoveryActionType.DISCOVERY_RECEIVING as const,
    peerId,
    name,
    percent,
})
export const receivingDone = () => ({
    type: DiscoveryActionType.DISCOVERY_RECEIVING_DONE as const,
})
export const resetDiscovery = () => ({
    type: DiscoveryActionType.DISCOVERY_RESET as const,
})

function locationErrorMessage(err: GeolocationPositionError): string {
    if (err.code === err.PERMISSION_DENIED) {
        return 'Location is off for this site, so nearby search can’t run. Use a code or a link instead.'
    }
    if (err.code === err.POSITION_UNAVAILABLE) {
        return 'This device couldn’t work out where it is right now. Try again, or use a code or a link instead.'
    }
    return 'Finding your location timed out. Try again, or use a code or a link instead.'
}

export const findNearby: () => (dispatch: Dispatch) => void = () => (dispatch) => {
    if (!('geolocation' in navigator)) {
        dispatch({
            type: DiscoveryActionType.DISCOVERY_NEARBY_ERROR as const,
            message: 'This device can’t share its location, so nearby search isn’t available. Use a code or a link instead.',
        })
        return
    }
    dispatch({ type: DiscoveryActionType.DISCOVERY_NEARBY_LOCATING as const, locating: true })
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            // Only the coarse hash leaves the device — it names the room.
            const hashes = nearbyGeohashes(pos.coords.latitude, pos.coords.longitude, 6)
            Transport.joinNearby(hashes)
            dispatch({ type: DiscoveryActionType.DISCOVERY_NEARBY_ACTIVE as const })
        },
        (err) => {
            dispatch({
                type: DiscoveryActionType.DISCOVERY_NEARBY_ERROR as const,
                message: locationErrorMessage(err),
            })
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
}

export const joinCodeRoom: (code: string) => (dispatch: Dispatch) => void =
    (code) => (dispatch) => {
        const clean = code.trim().toLowerCase()
        if (!/^[a-z0-9]{4,6}$/.test(clean)) {
            message.warning('Enter a code of 4 to 6 letters or numbers')
            return
        }
        Transport.joinRoom(codeRoomId(clean), 'code', 'code')
        dispatch({ type: DiscoveryActionType.DISCOVERY_CODE_JOINED as const, code: clean })
        message.info(`Joined code room “${clean}” — devices using the same code will show up here`)
    }

export const requestPeer: (peerId: string) => (dispatch: Dispatch) => void =
    (peerId) => (dispatch) => {
        Transport.requestConnection(peerId)
        dispatch({
            type: DiscoveryActionType.DISCOVERY_REQUEST_SENT as const,
            peerId,
        })
    }

export const acceptPeer: (peerId: string) => (dispatch: Dispatch) => void =
    (peerId) => (dispatch) => {
        Transport.acceptConnection(peerId)
        dispatch(addConnectionList(peerId))
        dispatch(requestAnswered(peerId))
    }

export const declinePeer: (peerId: string) => (dispatch: Dispatch) => void =
    (peerId) => (dispatch) => {
        Transport.declineConnection(peerId)
        dispatch(requestAnswered(peerId))
    }
