// @flow

import { handleActions } from 'redux-actions'

import type { MyPurchaseListState } from '../../flowtype/store-state'
import {
    GET_MY_PURCHASES_REQUEST,
    GET_MY_PURCHASES_SUCCESS,
    GET_MY_PURCHASES_FAILURE,
} from './constants'
import type {
    MyPurchasesAction,
    MyPurchasesErrorAction,
} from './types'

const initialState: MyPurchaseListState = {
    ids: [],
    fetching: false,
    error: null,
}

const reducer: (MyPurchaseListState) => MyPurchaseListState = handleActions({
    [GET_MY_PURCHASES_REQUEST]: (state: MyPurchaseListState): MyPurchaseListState => ({
        ...state,
        fetching: true,
        error: null,
    }),

    [GET_MY_PURCHASES_SUCCESS]: (state: MyPurchaseListState, action: MyPurchasesAction) => ({
        ...state,
        ids: action.payload.products,
        fetching: false,
    }),

    [GET_MY_PURCHASES_FAILURE]: (state: MyPurchaseListState, action: MyPurchasesErrorAction) => ({
        ...state,
        fetching: false,
        error: action.payload.error,
    }),

}, initialState)

export default reducer
