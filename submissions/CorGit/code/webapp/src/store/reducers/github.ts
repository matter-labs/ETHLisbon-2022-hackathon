import {BaseReducer} from "./index";
import {PullRequest} from "../../utils/ProjectTypes/Project.types";
import {createSlice} from "@reduxjs/toolkit";
import {clearError} from "../actions/basicActions";
import {setPullRequest} from "../actions/githubActions";

export interface GithubReducer extends BaseReducer {
  pullRequest: PullRequest | undefined,
}

/** -- INITIAL STATE */

const initialState: GithubReducer = {
  dispatchError: undefined,
  pullRequest: undefined,
};

/** --- CREATE THE REDUCER */

export const githubReducerSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    clearError,
    setPullRequest
  },
  extraReducers:
      (builder) => {

      }
  }
);

export const githubReducerActions = {
  setPullRequest: githubReducerSlice.actions.setPullRequest
}

export default githubReducerSlice.reducer
