import {combineReducers} from "redux";
import {UiReducer, uiReducerSlice} from "./ui";
import {UserAccountReducer, userAccountReducerSlice} from "./userAccount";
import {ErrorsEnum} from "../../utils/ProjectTypes/Errors.enum";
import {GithubReducer, githubReducerSlice} from "./github";
import {CgProjectReducer, cgProjectReducerSlice} from "./cgProject";
import {ContributionsReducer, contributionsReducerSlice} from "./contributions";

interface RootReducer {
  ui: UiReducer,
  userAccount: UserAccountReducer,
  contributions: ContributionsReducer,
  github: GithubReducer,
  cgProject: CgProjectReducer
}

const rootReducer = combineReducers<RootReducer>({
  ui: uiReducerSlice.reducer,
  contributions: contributionsReducerSlice.reducer,
  userAccount: userAccountReducerSlice.reducer,
  github: githubReducerSlice.reducer,
  cgProject: cgProjectReducerSlice.reducer
});

export default rootReducer;




/** -- DEFINE THE BASE REDUCER -- */

/**
 * Basic reducer interface, with members common to all reducers
 */
export interface BaseReducer {
  dispatchError?: DispatchError | undefined
}

/**
 * Single error element, in response to a specific dispatch action
 *
 * @property {string} code - custom internal code
 * @property {string} message - customer error message
 * @property {string} action - the action that caused this error
 */
export interface DispatchError {
  code?: ErrorsEnum | string,
  message: string,
  action: string
}


