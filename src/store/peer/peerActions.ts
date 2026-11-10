import { PeerActionType } from './peerTypes'
import type { RootState } from '../index'
import { Dispatch } from 'redux'
import { Transport, generateSessionCode } from '../../helpers/transport'
import { loadDisplayName, saveDisplayName } from '../../helpers/displayName'
import { message } from 'antd'
import { addConnectionList, removeConnectionList } from '../connection/connectionActions'
import { addHistoryEntry } from '../history/historyActions'
import {
    peerFound,
    peerGone,
    peerNamed,
    requestIncoming,
    requestAnswered,
    receivingProgress,
    receivingDone,
    resetDiscovery,
} from '../discovery/discoveryActions'
import download from 'js-file-download'

export const startPeerSession = (id: string) => ({
    type: PeerActionType.PEER_SESSION_START,
    id,
})

export const stopPeerSession = () => ({
    type: PeerActionType.PEER_SESSION_STOP,
})
export const setLoading = (loading: boolean) => ({
    type: PeerActionType.PEER_LOADING,
    loading,
})
export const setDisplayName = (name: string) => ({
    type: PeerActionType.PEER_NAME_CHANGE,
    name,
})

export const changeDisplayName: (name: string) => (dispatch: Dispatch) => void =
    (name) => (dispatch) => {
        const clean = name.trim().slice(0, 24)
        if (!clean) return
        saveDisplayName(clean)
        Transport.setDisplayName(clean)
        dispatch(setDisplayName(clean))
    }

const shortId = (peerId: string) => peerId.slice(0, 8)

export const startPeer: () => (dispatch: Dispatch, getState: () => RootState) => Promise<void> =
    () => async (dispatch, getState) => {
        dispatch(setLoading(true))
        try {
            const displayName = loadDisplayName()
            const sessionCode = generateSessionCode()
            const nameOf = (peerId: string) => getState().discovery.names[peerId] ?? shortId(peerId)
            // Whole-percent throttle for incoming-file progress dispatches.
            let lastReceivingPercent = -1

            Transport.init(
                {
                    onPeerFound: (peerId, roomId, via) => {
                        dispatch(peerFound({ peerId, name: shortId(peerId), roomId, via }))
                    },
                    onPeerGone: (peerId) => {
                        dispatch(peerGone(peerId))
                        dispatch(removeConnectionList(peerId))
                    },
                    onPeerNamed: (peerId, name, roomId, via) => {
                        dispatch(peerNamed(peerId, name, roomId, via))
                    },
                    onRequest: (peerId, name) => {
                        dispatch(requestIncoming(peerId, name))
                    },
                    onAccepted: (peerId) => {
                        dispatch(addConnectionList(peerId))
                        dispatch(requestAnswered(peerId))
                        message.success(`${nameOf(peerId)} accepted — you can send now`)
                    },
                    onDeclined: (peerId) => {
                        dispatch(requestAnswered(peerId))
                        message.info(`${nameOf(peerId)} declined the connection`)
                    },
                    onFile: (peerId, data, meta) => {
                        dispatch(receivingDone())
                        const fileBlob = new Blob([data], { type: meta.type })
                        dispatch(addHistoryEntry('received-file', meta.name, nameOf(peerId), {
                            kind: 'file',
                            blob: fileBlob,
                            fileName: meta.name,
                        }))
                        download(fileBlob, meta.name, meta.type)
                        message.info(`Received file ${meta.name} from ${nameOf(peerId)}`)
                    },
                    onMessage: (peerId, text) => {
                        dispatch(addHistoryEntry('received-msg', text, nameOf(peerId), { kind: 'text', text }))
                        navigator.clipboard.writeText(text).catch(() => undefined)
                        message.info(`Received a message from ${nameOf(peerId)} — copied to clipboard`)
                    },
                    onFileReceiveProgress: (peerId, percent, meta) => {
                        const whole = Math.round(percent * 100)
                        if (whole !== lastReceivingPercent) {
                            lastReceivingPercent = whole
                            dispatch(receivingProgress(peerId, meta.name, whole))
                        }
                    },
                },
                displayName,
            )
            Transport.start(sessionCode)
            dispatch(setDisplayName(displayName))
            dispatch(startPeerSession(sessionCode))
            dispatch(setLoading(false))
        } catch (err) {
            console.log(err)
            dispatch(setLoading(false))
        }
    }

export const stopPeer: () => (dispatch: Dispatch) => Promise<void> = () => async (dispatch) => {
    await Transport.leaveAll()
    dispatch(resetDiscovery())
    dispatch(stopPeerSession())
}
