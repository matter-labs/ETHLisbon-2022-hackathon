import {createSlice} from "@reduxjs/toolkit";
import {set, toggle} from "../actions/uiActions";
import {BaseReducer} from "./index";

/** -- DEFINITIONS */

/**
 * Define the shape of the reducer, by specifying the type of element accepted in each reducer elements
 *
 * @property {UiReducerElement<boolean>} isBackdropActive - if the backdrop should be active or not
 */
export interface UiReducer extends BaseReducer {
  showLoginDialog: UiReducerElement<boolean>,
  loginMethodSelected: UiReducerElement<LoginMethods | undefined>,
}

/**
 * The single value of an entry in this ui reducer
 *
 * @property {boolean} state - true or false to say it's enable / disabled
 * @property {T} value - a custom value that can be associated
 */
export interface UiReducerElement<T> {
  state: boolean,
  value: T
}

/**
 * Define the possible values of the UI Store
 */
export enum AllowedUiReducerName {
  ShowLoginDialog = "showLoginDialog",  // show / hide the login dialog in the /login page
  LoginMethodSelected = "loginMethodSelected",  // shows the path for the given login selected by the user
}

/**
 * Represent the constants to identify the type of logins available to the user
 */
export enum LoginMethods {
  NOT_SELECTED = "NOT_SELECTED",  // when nothis has been selected
  WALLET= "WALLET",
  EMAIL= "EMAIL"
}

/** -- INITIAL STATE */

const initialState: UiReducer  = {
  showLoginDialog: { state: false, value: false },
  loginMethodSelected: { state: true, value: LoginMethods.NOT_SELECTED}
};

/** --- CREATE THE REDUCER */

export const uiReducerSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    set,
    toggle
  }
})


export const uiReducerActions = {
  set: uiReducerSlice.actions.set,
  toggle: uiReducerSlice.actions.toggle
}


export default uiReducerSlice.reducer

