import { HistoryActionType, HistoryEntry, HistoryKind } from "./historyTypes";

export type HistoryPayload =
    | { kind: 'text'; text: string }
    | { kind: 'file'; blob: Blob; fileName: string }

const MAX_HISTORY_ENTRIES = 50
const historyPayloads = new Map<string, HistoryPayload>()

export const getHistoryPayload = (entryId: string): HistoryPayload | undefined => historyPayloads.get(entryId)

export const addHistoryEntry = (
    kind: HistoryKind,
    label: string,
    peerId: string,
    payload?: HistoryPayload,
): { type: HistoryActionType.HISTORY_ADD; entry: HistoryEntry } => {
    const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind,
        label: label.length > 120 ? label.slice(0, 117) + '…' : label,
        peerId,
        at: Date.now()
    }

    if (payload) {
        historyPayloads.set(entry.id, payload)
        while (historyPayloads.size > MAX_HISTORY_ENTRIES) {
            const oldestId = historyPayloads.keys().next().value
            if (oldestId === undefined) break
            historyPayloads.delete(oldestId)
        }
    }

    return { type: HistoryActionType.HISTORY_ADD, entry }
}
