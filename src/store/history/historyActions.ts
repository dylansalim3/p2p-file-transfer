import { HistoryActionType, HistoryEntry, HistoryKind } from "./historyTypes";

export const addHistoryEntry = (kind: HistoryKind, label: string, peerId: string): { type: HistoryActionType.HISTORY_ADD; entry: HistoryEntry } => ({
    type: HistoryActionType.HISTORY_ADD,
    entry: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind,
        label: label.length > 120 ? label.slice(0, 117) + '…' : label,
        peerId,
        at: Date.now()
    }
})
