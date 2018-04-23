// @flow

import { handleActions } from 'redux-actions'

import type { ContractProductState } from '../../flowtype/store-state'

import {
    GET_PRODUCT_FROM_CONTRACT_FAILURE,
    GET_PRODUCT_FROM_CONTRACT_REQUEST,
    GET_PRODUCT_FROM_CONTRACT_SUCCESS,
} from './constants'
import type {
    ProductIdAction,
    ProductErrorAction,
} from './types'

const initialState: ContractProductState = {
    id: null,
    fetchingContractProduct: false,
    contractProductError: null,
}

const reducer: (ContractProductState) => ContractProductState = handleActions({
    [GET_PRODUCT_FROM_CONTRACT_REQUEST]: (state: ContractProductState, action: ProductIdAction) => ({
        ...state,
        id: action.payload.id,
        fetchingContractProduct: true,
        contractProductError: null,
    }),

    [GET_PRODUCT_FROM_CONTRACT_SUCCESS]: (state: ContractProductState) => ({
        ...state,
        fetchingContractProduct: false,
    }),

    [GET_PRODUCT_FROM_CONTRACT_FAILURE]: (state: ContractProductState, action: ProductErrorAction) => ({
        ...state,
        fetchingContractProduct: false,
        contractProductError: action.payload.error,
    }),

}, initialState)

export default reducer
