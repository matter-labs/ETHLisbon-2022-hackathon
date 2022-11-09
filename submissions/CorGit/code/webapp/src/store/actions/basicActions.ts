import {CaseReducer, PayloadAction} from "@reduxjs/toolkit";
import {BaseReducer} from "../reducers";


/** -- ACTIONS */

/**
 * To fully set a value
 * @param {Draft<BaseReducer>} state
 * @param {PayloadAction<undefined>} action
 */
export const clearError: CaseReducer<any, PayloadAction<undefined>> = (state, action) => {
  state.dispatchError = undefined
}



