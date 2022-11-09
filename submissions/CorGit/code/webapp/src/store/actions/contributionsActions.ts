import {CaseReducer, PayloadAction} from "@reduxjs/toolkit";
import {ContributionsReducer} from "../reducers/contributions";
import {ProjectUserContributionInterface} from "../../hooks/useLoadProjectUserContributions";

export const setUserContributions: CaseReducer<ContributionsReducer, PayloadAction<ProjectUserContributionInterface[]>> =
    (state, action) => {
      state.userContributions = action.payload;
    };


