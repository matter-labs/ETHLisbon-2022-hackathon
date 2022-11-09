import {CaseReducer, PayloadAction} from "@reduxjs/toolkit";
import {PullRequest} from "../../utils/ProjectTypes/Project.types";
import {GithubReducer} from "../reducers/github";

export const setPullRequest: CaseReducer<GithubReducer, PayloadAction<PullRequest>> =
    (state, action) => {
      state.pullRequest = action.payload;
    }
