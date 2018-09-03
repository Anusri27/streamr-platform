// @flow

import { createAction } from 'redux-actions'

import type { ReduxActionCreator, ErrorInUi, NumberString } from '../../flowtype/common-types'
import type TransactionError from '../../errors/TransactionError'

import {
    GET_DATA_USD_RATE_REQUEST,
    GET_DATA_USD_RATE_SUCCESS,
    GET_DATA_USD_RATE_FAILURE,
    CHECK_ETHEREUM_NETWORK_REQUEST,
    CHECK_ETHEREUM_NETWORK_SUCCESS,
    CHECK_ETHEREUM_NETWORK_FAILURE,
    CHECK_METAMASK,
} from './constants'
import type { DataPerUsdActionCreator, GlobalEthereumErrorActionCreator, IsMetaMaskInUseActionCreator } from './types'
import * as services from './services'

const getDataPerUsdRequest: ReduxActionCreator = createAction(GET_DATA_USD_RATE_REQUEST)

const getDataPerUsdSuccess: DataPerUsdActionCreator = createAction(
    GET_DATA_USD_RATE_SUCCESS,
    (dataPerUsd: NumberString) => ({
        dataPerUsd,
    }),
)

const getDataPerUsdError: GlobalEthereumErrorActionCreator = createAction(
    GET_DATA_USD_RATE_FAILURE,
    (error: TransactionError) => ({
        error,
    }),
)

export const getDataPerUsd = () => (dispatch: Function) => {
    dispatch(getDataPerUsdRequest())
    return services
        .getDataPerUsd()
        .then(
            (dataPerUsd: NumberString) => dispatch(getDataPerUsdSuccess(dataPerUsd)),
            (error: TransactionError) => {
                dispatch(getDataPerUsdError({
                    message: error.message,
                }))
            },
        )
}

const checkEthereumNetworkRequest: ReduxActionCreator = createAction(CHECK_ETHEREUM_NETWORK_REQUEST)

const checkEthereumNetworkSuccess: ReduxActionCreator = createAction(CHECK_ETHEREUM_NETWORK_SUCCESS)

const checkEthereumNetworkError: GlobalEthereumErrorActionCreator = createAction(
    CHECK_ETHEREUM_NETWORK_FAILURE,
    (error: ErrorInUi) => ({
        error,
    }),
)

export const checkEthereumNetwork = () => (dispatch: Function) => {
    dispatch(checkEthereumNetworkRequest())
    return services
        .checkEthereumNetworkIsCorrect()
        .then(
            () => dispatch(checkEthereumNetworkSuccess()),
            (error: TransactionError) => {
                dispatch(checkEthereumNetworkError({
                    message: error.message,
                }))
            },
        )
}

const checkMetaMaskSuccess: IsMetaMaskInUseActionCreator = createAction(
    CHECK_METAMASK,
    (isMetaMaskInUse: boolean) => ({
        isMetaMaskInUse,
    }),
)

export const checkMetaMask = () => (dispatch: Function) => {
    const isMetaMaskInUse = services.isMetaMaskInUse()
    dispatch(checkMetaMaskSuccess(isMetaMaskInUse))
}
