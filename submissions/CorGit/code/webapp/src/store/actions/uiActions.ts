import {CaseReducer, PayloadAction} from "@reduxjs/toolkit";
import {AllowedUiReducerName, UiReducer, UiReducerElement} from "../reducers/ui";

/**
 * Shape of the action for the set() command
 * @param {AllowedUiReducerName} name - name of the settings
 * @param {UiReducerElement<T>} payload - the actual content of that setting
 */
export interface UiReducerSetAction<T> {
  name: AllowedUiReducerName,
  payload: UiReducerElement<T>
}

/**
 * Shape of the action for the toggle() command
 * @param {AllowedUiReducerName} name - name of the settings
 * @param {boolean} state - the value to set (true / false) in the setting's state
 */
export interface UiReducerToggleAction {
  name: AllowedUiReducerName,
  state: boolean
}

/** -- ACTIONS */

/**
 * To fully set a value
 * @param {Draft<UiReducer>} state
 * @param {PayloadAction<UiReducerSetAction<any>>} action
 */
export const set: CaseReducer<UiReducer, PayloadAction<UiReducerSetAction<any>>> = (state, action) => {
  // @ts-ignore
  state[action.payload.name] = action.payload.payload;
}

/**
 * To set the state of a value
 * @param {Draft<UiReducer>} state
 * @param {PayloadAction<UiReducerToggleAction>} action
 */
export const toggle: CaseReducer<UiReducer, PayloadAction<UiReducerToggleAction>> = (state, action) => {
  state[action.payload.name].state = action.payload.state
}
