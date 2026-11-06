// Transport over Trystero rooms (default strategy: Nostr public relays, no setup).
//
// One device joins several rooms at once:
//   - personal room  `p2p-<session code>` — always joined on Start. This is the
//     address the QR code and share link point at: a second phone opening the
//     link joins this room and the two devices find each other.
//   - nearby rooms   `p2p-nearby-<geohash>` — 9 coarse cells (own cell + 8
//     neighbours). Only the coarse hash goes to the signalling medium, never
//     precise coordinates.
//   - code room      `p2p-<code>` — both phones enter the same short code.
//
// Trystero connects peers in a room at the transport level as soon as both
// are in it. The accept step is enforced at the app level on top of that:
// a peer is only "connected" after an explicit accept, and the file/message
// actions refuse (via onReceive) any data from a peer that has not been
// accepted, so no file or text can flow before the other side taps Accept.
// Only the handshake actions (presence / request / accept / decline) travel
// before that point.
//
// Signalling note: session descriptions pass through the relay medium in
// plaintext (per Trystero's docs). Data channels themselves are encrypted
// once peers connect. No TURN is configured, so strict networks can still
// fail to connect — same limit as the old PeerJS transport.

import { joinRoom, selfId } from 'trystero'
import type { MessageAction, Room } from 'trystero'

export type RoomKind = 'personal' | 'nearby' | 'code'
export type Via = 'nearby' | 'code' | 'link'

export type FileMeta = {
    name: string
    size: number
    type: string
}

export interface TransportCallbacks {
    onPeerFound: (peerId: string, roomId: string, via: Via) => void
    onPeerGone: (peerId: string) => void
    onPeerNamed: (peerId: string, name: string, roomId: string, via: Via) => void
    onRequest: (peerId: string, name: string) => void
    onAccepted: (peerId: string) => void
    onDeclined: (peerId: string) => void
    onFile: (peerId: string, data: ArrayBuffer, meta: FileMeta) => void
    onMessage: (peerId: string, text: string) => void
    onFileReceiveProgress: (peerId: string, percent: number, meta: FileMeta) => void
}

interface JoinedRoom {
    room: Room
    kind: RoomKind
    via: Via
    presence: MessageAction<{ name: string }>
    request: MessageAction<{ name: string }>
    accept: MessageAction<{ name: string }>
    decline: MessageAction<{ name: string }>
    file: MessageAction<ArrayBuffer>
    msg: MessageAction<string>
}

const APP_ID = 'p2p-file-transfer'
const SESSION_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789' // no 0/O, 1/I/l

export function generateSessionCode(): string {
    const bytes = new Uint8Array(6)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => SESSION_ALPHABET[b % SESSION_ALPHABET.length]).join('')
}

export function personalRoomId(sessionCode: string): string {
    return `p2p-${sessionCode}`
}

export function nearbyRoomId(geohash: string): string {
    return `p2p-nearby-${geohash}`
}

export function codeRoomId(code: string): string {
    return `p2p-${code.trim().toLowerCase()}`
}

let callbacks: TransportCallbacks | null = null
let myName = ''
const rooms = new Map<string, JoinedRoom>()
// peerId -> roomIds where the peer has been seen (a peer can appear in
// several nearby cells at once).
const peerRooms = new Map<string, Set<string>>()
// Peers the app-level accept gate has let through.
const accepted = new Set<string>()

function roomForPeer(peerId: string): JoinedRoom | undefined {
    const ids = peerRooms.get(peerId)
    if (!ids) return undefined
    for (const id of ids) {
        const joined = rooms.get(id)
        if (joined) return joined
    }
    return undefined
}

function wireRoom(roomId: string, kind: RoomKind, via: Via): JoinedRoom {
    const room = joinRoom({ appId: APP_ID }, roomId)

    const presence = room.makeAction<{ name: string }>('presence')
    const request = room.makeAction<{ name: string }>('connect-request')
    const accept = room.makeAction<{ name: string }>('connect-accept')
    const decline = room.makeAction<{ name: string }>('connect-decline')
    const file = room.makeAction<ArrayBuffer>('file')
    const msg = room.makeAction<string>('msg')

    presence.onMessage = (data, { peerId }) => {
        callbacks?.onPeerNamed(peerId, data.name, roomId, via)
    }
    request.onMessage = (data, { peerId }) => {
        if (!accepted.has(peerId)) {
            callbacks?.onRequest(peerId, data.name)
        }
    }
    accept.onMessage = (_data, { peerId }) => {
        accepted.add(peerId)
        callbacks?.onAccepted(peerId)
    }
    decline.onMessage = (_data, { peerId }) => {
        callbacks?.onDeclined(peerId)
    }
    // App-level accept gate, enforced before any payload is accepted.
    file.onReceive = ({ peerId }) => accepted.has(peerId)
    file.onMessage = (data, { peerId, metadata }) => {
        const meta = (metadata || {}) as unknown as FileMeta
        callbacks?.onFile(peerId, data, {
            name: meta.name || 'file',
            size: typeof meta.size === 'number' ? meta.size : data.byteLength,
            type: meta.type || '',
        })
    }
    file.onReceiveProgress = (percent, { peerId, metadata }) => {
        const meta = (metadata || {}) as unknown as FileMeta
        callbacks?.onFileReceiveProgress(peerId, percent, {
            name: meta.name || 'file',
            size: typeof meta.size === 'number' ? meta.size : 0,
            type: meta.type || '',
        })
    }
    msg.onReceive = ({ peerId }) => accepted.has(peerId)
    msg.onMessage = (data, { peerId }) => {
        callbacks?.onMessage(peerId, data)
    }

    room.onPeerJoin = (peerId) => {
        let set = peerRooms.get(peerId)
        if (!set) {
            set = new Set()
            peerRooms.set(peerId, set)
        }
        set.add(roomId)
        callbacks?.onPeerFound(peerId, roomId, via)
        // Tell the newcomer who we are (they may have missed the broadcast).
        presence.send({ name: myName }, { target: peerId }).catch(() => undefined)
    }
    room.onPeerLeave = (peerId) => {
        const set = peerRooms.get(peerId)
        if (set) {
            set.delete(roomId)
            if (set.size === 0) {
                peerRooms.delete(peerId)
                callbacks?.onPeerGone(peerId)
            }
        }
    }

    const joined: JoinedRoom = { room, kind, via, presence, request, accept, decline, file, msg }
    rooms.set(roomId, joined)
    // Announce ourselves to everyone already in the room.
    presence.send({ name: myName }).catch(() => undefined)
    return joined
}

export const Transport = {
    get selfId(): string {
        return selfId
    },

    init(cb: TransportCallbacks, displayName: string): void {
        callbacks = cb
        myName = displayName
    },

    setDisplayName(displayName: string): void {
        myName = displayName
        // Re-announce so peers already in our rooms see the new name.
        for (const { presence } of rooms.values()) {
            presence.send({ name: myName }).catch(() => undefined)
        }
    },

    /** Join the personal room and start listening. Returns our peer id. */
    start(sessionCode: string): string {
        wireRoom(personalRoomId(sessionCode), 'personal', 'link')
        return selfId
    },

    joinRoom(roomId: string, kind: RoomKind, via: Via): void {
        if (!rooms.has(roomId)) {
            wireRoom(roomId, kind, via)
        }
    },

    joinNearby(geohashes: string[]): void {
        for (const hash of geohashes) {
            Transport.joinRoom(nearbyRoomId(hash), 'nearby', 'nearby')
        }
    },

    isAccepted(peerId: string): boolean {
        return accepted.has(peerId)
    },

    requestConnection(peerId: string): void {
        const joined = roomForPeer(peerId)
        joined?.request.send({ name: myName }, { target: peerId }).catch(() => undefined)
    },

    acceptConnection(peerId: string): void {
        accepted.add(peerId)
        const joined = roomForPeer(peerId)
        joined?.accept.send({ name: myName }, { target: peerId }).catch(() => undefined)
    },

    declineConnection(peerId: string): void {
        const joined = roomForPeer(peerId)
        joined?.decline.send({ name: myName }, { target: peerId }).catch(() => undefined)
    },

    sendFile(
        peerId: string,
        data: ArrayBuffer,
        meta: FileMeta,
        onProgress: (percent: number) => void,
    ): Promise<void> {
        const joined = roomForPeer(peerId)
        if (!joined) {
            return Promise.reject(new Error('Not connected to that device'))
        }
        return joined.file.send(data, {
            target: peerId,
            metadata: meta,
            onProgress: (percent) => onProgress(percent),
        })
    },

    sendMessage(peerId: string, text: string): Promise<void> {
        const joined = roomForPeer(peerId)
        if (!joined) {
            return Promise.reject(new Error('Not connected to that device'))
        }
        return joined.msg.send(text, { target: peerId })
    },

    leaveAll(): Promise<void> {
        const leaving = [...rooms.values()].map(({ room }) => room.leave().catch(() => undefined))
        rooms.clear()
        peerRooms.clear()
        accepted.clear()
        return Promise.all(leaving).then(() => undefined)
    },
}
