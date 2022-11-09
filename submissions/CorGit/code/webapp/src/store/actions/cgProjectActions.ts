import {CaseReducer, PayloadAction} from "@reduxjs/toolkit";
import {CgProjectReducer} from "../reducers/cgProject";


export interface CgProjectInformationInterface {
  tokenAddress: string,
  tokenSymbol: string,
  distributionReward: number,
  tokenName: string,
  isPayer: boolean,
  tokenTotalSupply: number,
  unclaimedRewards: number,
  treasuryBalance: number,
  collectedRewards: number,
  tokenValue: number
}

export const setCgProjectInformation: CaseReducer<CgProjectReducer, PayloadAction<CgProjectInformationInterface>> =
    (state, action) => {
      state.tokenSymbol = action.payload.tokenSymbol;
      state.tokenAddress = action.payload.tokenAddress;
      state.collectedRewards = action.payload.collectedRewards;
      state.distributionReward = action.payload.distributionReward;
      state.unclaimedRewards = action.payload.unclaimedRewards;
      state.tokenName = action.payload.tokenName;
      state.tokenValue = action.payload.tokenValue;
      state.treasuryBalance = action.payload.treasuryBalance;
      state.isPayer = action.payload.isPayer;
      state.tokenTotalSupply = action.payload.tokenTotalSupply;
    }

export const setTokenAddress: CaseReducer<CgProjectReducer, PayloadAction<string>> =
    (state, action) => {
      state.tokenAddress = action.payload;
    };
