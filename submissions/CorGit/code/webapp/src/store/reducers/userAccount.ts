import {createSlice} from "@reduxjs/toolkit";
import {setChainId, setConnectedAccount} from "../actions/userAccountActions";
import {BaseReducer} from "./index";
import {clearError} from "../actions/basicActions";

/** -- DEFINITIONS */


/**
 * Define the shape of the reducer, by specifying the type of element accepted in each reducer elements
 *
 * @param {string} connectedWalletAddress - address of the metamask wallet connected
 *
 */
export interface UserAccountReducer extends BaseReducer {
  connectedWalletAddress: string,
  chainId: number
}


/** -- INITIAL STATE */

const initialState: UserAccountReducer = {
  dispatchError: undefined,
  connectedWalletAddress: "",
  chainId: 0
};



/** --- CREATE THE REDUCER */

export const userAccountReducerSlice = createSlice({
  name: 'userAccount',
  initialState,
  reducers: {
    clearError,
    setConnectedAccount,
    setChainId
  },
  extraReducers:
    (builder) => {

    }
})

export const userAccountReducerActions = {
  clearError: userAccountReducerSlice.actions.clearError,
  setConnectedAccount: userAccountReducerSlice.actions.setConnectedAccount,
  setChainId: userAccountReducerSlice.actions.setChainId
}

export default userAccountReducerSlice.reducer
