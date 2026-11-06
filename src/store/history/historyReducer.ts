import { Reducer } from "redux";
import { HistoryAction, HistoryActionType, HistoryState } from "./historyTypes";

export const initialState: HistoryState = {
    entries: []
}

const MAX_ENTRIES = 50

export const HistoryReducer: Reducer<HistoryState, HistoryAction> = (state = initialState, action) => {
    if (action.type === HistoryActionType.HISTORY_ADD) {
        return { ...state, entries: [action.entry, ...state.entries].slice(0, MAX_ENTRIES) }
    }
    return state
}
