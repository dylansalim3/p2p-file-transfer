export type HistoryKind = 'sent-file' | 'sent-msg' | 'received-file' | 'received-msg'

export interface HistoryEntry {
    readonly id: string
    readonly kind: HistoryKind
    readonly label: string
    readonly peerId: string
    readonly at: number
}

export enum HistoryActionType {
    HISTORY_ADD = 'HISTORY_ADD'
}

export type HistoryAction =
    | { type: HistoryActionType.HISTORY_ADD; entry: HistoryEntry }

export interface HistoryState {
    readonly entries: HistoryEntry[]
}
