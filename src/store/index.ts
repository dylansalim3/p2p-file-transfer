import {configureStore} from '@reduxjs/toolkit'
import {Reducer} from "redux";
import {PeerReducer} from "./peer/peerReducer";
import {ConnectionReducer} from "./connection/connectionReducer";
import {HistoryReducer} from "./history/historyReducer";
import {PeerState} from "./peer/peerTypes";
import {ConnectionState} from "./connection/connectionTypes";
import {HistoryState} from "./history/historyTypes";

// The reducers are typed with the app's own discriminated action unions.
// The store may also dispatch internal actions (e.g. @@redux/INIT), which
// both reducers ignore via their default branch, so they are safe to widen
// here; the cast only bridges the store's UnknownAction parameter type.
export const store = configureStore({
    reducer: {
        peer: PeerReducer as Reducer<PeerState>,
        connection: ConnectionReducer as Reducer<ConnectionState>,
        history: HistoryReducer as Reducer<HistoryState>
    }
})

window.store = store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
