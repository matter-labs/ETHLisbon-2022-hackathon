import {BaseReducer} from "./index";
import {ProjectUserContributionInterface} from "../../hooks/useLoadProjectUserContributions";
import {createSlice} from "@reduxjs/toolkit";
import {clearError} from "../actions/basicActions";
import {setUserContributions} from "../actions/contributionsActions";

export interface ContributionsReducer extends BaseReducer {
  userContributions: ProjectUserContributionInterface[]
}

/** -- INITIAL STATE */

const initialState: ContributionsReducer = {
  dispatchError: undefined,
  userContributions: [],
};

/** --- CREATE THE REDUCER */

export const contributionsReducerSlice = createSlice({
      name: 'contributions',
      initialState,
      reducers: {
        clearError,
        setUserContributions
      },
      extraReducers:
          (builder) => {

          }
    }
);

export const contributionsReducerActions = {
  setUserContributions: contributionsReducerSlice.actions.setUserContributions
}

export default contributionsReducerSlice.reducer
