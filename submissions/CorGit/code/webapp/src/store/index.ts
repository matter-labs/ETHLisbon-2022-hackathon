import rootReducer from "./reducers";
import {logger} from "redux-logger";
import thunk from 'redux-thunk';
import {configureStore} from "@reduxjs/toolkit";


export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk, logger),
  devTools: process.env.NODE_ENV !== 'production'
})

export const getStoreRef = ()  => {
  return store;
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
