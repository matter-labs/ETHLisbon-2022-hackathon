import {BaseReducer} from "./index";
import {createSlice} from "@reduxjs/toolkit";
import {clearError} from "../actions/basicActions";
import {setCgProjectInformation, setTokenAddress} from "../actions/cgProjectActions";

export interface CgProjectReducer extends BaseReducer {
  tokenName: string,
  tokenSymbol: string,
  tokenAddress: string,
  tokenTotalSupply: number,
  treasuryBalance: number,
  unclaimedRewards: number,
  collectedRewards: number,
  distributionReward: number,
  tokenValue: number,
  isPayer: boolean
}

/** -- INITIAL STATE */

const initialState: CgProjectReducer = {
  tokenName: "",
  tokenSymbol: "",
  tokenAddress: "",
  tokenTotalSupply: 0,
  tokenValue: 0,
  treasuryBalance: 0,
  unclaimedRewards: 0,
  collectedRewards: 0,
  distributionReward: 0,
  isPayer: false
}

/** --- CREATE THE REDUCER */

export const cgProjectReducerSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearError,
    setCgProjectInformation,
    setTokenAddress
  },
  extraReducers:
      (builder) => {

      }
});

export const cgProjectReducerActions = {
  setCgProjectInformation: cgProjectReducerSlice.actions.setCgProjectInformation,
  setTokenAddress: cgProjectReducerSlice.actions.setTokenAddress
}

export default cgProjectReducerSlice.reducer
