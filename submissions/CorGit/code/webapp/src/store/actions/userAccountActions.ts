import {CaseReducer, PayloadAction} from "@reduxjs/toolkit";
import {UserAccountReducer} from "../reducers/userAccount";


/** -- ACTIONS */

/**
 * Stores the connected account at browser level
 * @param {Draft<UserAccountReducer>} state
 * @param {PayloadAction<string>} action
 */
export const setConnectedAccount: CaseReducer<UserAccountReducer, PayloadAction<string>> =
  (state, action) => {
    state.connectedWalletAddress = action.payload
  }

/**
 * Stores the id of the connected chain
 * @param {Draft<UserAccountReducer>} state
 * @param {PayloadAction<number>} action - id of the chain
 */
export const setChainId: CaseReducer<UserAccountReducer, PayloadAction<number>> =
  (state, action) => {
    state.chainId = action.payload
  }



