import { ConnectionActionType } from './connectionTypes'
import { Dispatch } from 'redux'
import { Transport, codeRoomId } from '../../helpers/transport'
import { message } from 'antd'

export const changeConnectionInput = (id: string) => ({
    type: ConnectionActionType.CONNECTION_INPUT_CHANGE,
    id,
})

export const setLoading = (loading: boolean) => ({
    type: ConnectionActionType.CONNECTION_CONNECT_LOADING,
    loading,
})
export const addConnectionList = (id: string) => ({
    type: ConnectionActionType.CONNECTION_LIST_ADD,
    id,
})

export const removeConnectionList = (id: string) => ({
    type: ConnectionActionType.CONNECTION_LIST_REMOVE,
    id,
})

export const selectItem = (id: string) => ({
    type: ConnectionActionType.CONNECTION_ITEM_SELECT,
    id,
})

// Joining a room is the whole "connect" step now: any device in the same
// room shows up in discovery, and a tap + accept turns it into a connection.
export const connectPeer: (id: string) => (dispatch: Dispatch) => Promise<void> =
    (id: string) =>
    async (dispatch) => {
        dispatch(setLoading(true))
        try {
            const clean = id.trim().toLowerCase()
            if (!clean) {
                message.warning('Please enter an ID or code')
                dispatch(setLoading(false))
                return
            }
            Transport.joinRoom(codeRoomId(clean), 'code', 'link')
            dispatch(setLoading(false))
            message.info('Joined — devices in this room will show up below')
        } catch (err) {
            dispatch(setLoading(false))
            console.log(err)
        }
    }
