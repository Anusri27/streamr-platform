// @flow

import { createAction } from 'redux-actions'

import type { ReduxActionCreator, ErrorInUi } from '../../flowtype/common-types'
import type { ApiKey, User } from '../../flowtype/user-types'
import type { Web3AccountList } from '../../flowtype/web3-types'
import type { ProductId } from '../../flowtype/product-types'
import type {
    ProductIdActionCreator,
    ProductErrorActionCreator,
} from '../product/types'
import type {
    ApiKeyActionCreator,
    Web3AccountsActionCreator,
    UserErrorActionCreator,
    UserDataActionCreator,
} from './types'

import * as services from './services'
import {
    LOGIN_KEYS_REQUEST,
    LOGIN_KEYS_SUCCESS,
    LOGIN_KEYS_FAILURE,
    LINKED_WEB3_ACCOUNTS_REQUEST,
    LINKED_WEB3_ACCOUNTS_SUCCESS,
    LINKED_WEB3_ACCOUNTS_FAILURE,
    LOGOUT,
    USER_DATA_REQUEST,
    USER_DATA_SUCCESS,
    USER_DATA_FAILURE,
    GET_USER_PRODUCT_PERMISSIONS_REQUEST,
    GET_USER_PRODUCT_PERMISSIONS_SUCCESS,
    GET_USER_PRODUCT_PERMISSIONS_FAILURE,
    EXTERNAL_LOGIN_START,
    EXTERNAL_LOGIN_END,
} from './constants'

export const logout: ReduxActionCreator = createAction(LOGOUT)

// Login keys
export const apiKeysRequest: ReduxActionCreator = createAction(LOGIN_KEYS_REQUEST)
export const apiKeysSuccess: ApiKeyActionCreator = createAction(LOGIN_KEYS_SUCCESS, (apiKey: ApiKey) => ({
    apiKey,
}))
export const apiKeysError: UserErrorActionCreator = createAction(LOGIN_KEYS_FAILURE, (error: ErrorInUi) => ({
    error,
}))

// Linked web3 accounts
export const linkedWeb3AccountsRequest: ReduxActionCreator = createAction(LINKED_WEB3_ACCOUNTS_REQUEST)
export const linkedWeb3AccountsSuccess: Web3AccountsActionCreator = createAction(LINKED_WEB3_ACCOUNTS_SUCCESS, (accounts: Web3AccountList) => ({
    accounts,
}))
export const linkedWeb3AccountsError: UserErrorActionCreator = createAction(LINKED_WEB3_ACCOUNTS_FAILURE, (error: ErrorInUi) => ({
    error,
}))

// Fetching user data
export const getUserDataRequest: ReduxActionCreator = createAction(USER_DATA_REQUEST)
export const getUserDataSuccess: UserDataActionCreator = createAction(USER_DATA_SUCCESS, (user: User) => ({
    user,
}))
export const getUserDataError: UserErrorActionCreator = createAction(USER_DATA_FAILURE, (error: ErrorInUi) => ({
    error,
}))

export const getUserProductPermissionsRequest: ProductIdActionCreator = createAction(
    GET_USER_PRODUCT_PERMISSIONS_REQUEST,
    (id: ProductId) => ({
        id,
    }),
)

export const getUserProductPermissionsSuccess = createAction(
    GET_USER_PRODUCT_PERMISSIONS_SUCCESS,
    (read: boolean, write: boolean, share: boolean) => ({
        read,
        write,
        share,
    }),
)

export const getUserProductPermissionsFailure: ProductErrorActionCreator = createAction(
    GET_USER_PRODUCT_PERMISSIONS_FAILURE,
    (error: ErrorInUi) => ({
        error,
    }),
)

// Fetch linked web3 accounts from integration keys
export const fetchLinkedWeb3Accounts = () => (dispatch: Function) => {
    dispatch(linkedWeb3AccountsRequest())

    return services.getIntegrationKeys()
        .then((result) => {
            const linkedWallets = result
                .filter(({ service }) => (service === 'ETHEREUM'))
                .map(({ name, json }) => ({
                    address: json.address,
                    name,
                }))

            dispatch(linkedWeb3AccountsSuccess(linkedWallets))
        })
        .catch((error) => {
            dispatch(linkedWeb3AccountsError(error))
        })
}

// Fetch login keys, a token is saved to local storage and added to subsequent API calls
export const fetchApiKeys = () => (dispatch: Function) => {
    dispatch(apiKeysRequest())

    return services.getMyKeys()
        .then((result) => {
            // TODO: using first key here, not sure if there are others
            const apiKey = result[0]

            dispatch(apiKeysSuccess(apiKey))

            localStorage.setItem('marketplace_user_id', apiKey.id)

            dispatch(fetchLinkedWeb3Accounts())
        })
        .catch((error) => {
            dispatch(apiKeysError(error))

            // Session was not found so logout from marketplace
            dispatch(logout())
        })
}

// Get user data for logged in user
export const getUserData = () => (dispatch: Function) => {
    dispatch(getUserDataRequest())

    return services.getUserData()
        .then((user) => dispatch(getUserDataSuccess(user)))
        .catch((error) => dispatch(getUserDataError(error)))
}

export const getUserDataAndKeys = () => (dispatch: Function) => {
    dispatch(getUserData())
    dispatch(fetchApiKeys())
}

export const getUserProductPermissions = (id: ProductId) => (dispatch: Function) => {
    dispatch(getUserProductPermissionsRequest(id))
    return services
        .getUserProductPermissions(id)
        .then((result) => {
            const { read, write, share } = result.reduce((permissions, permission) => {
                if ('anonymous' in permission || !permission.operation) {
                    return permissions
                }
                return {
                    ...permissions,
                    ...{
                        [permission.operation]: true,
                    },
                }
            }, {})
            dispatch(getUserProductPermissionsSuccess(!!read, !!write, !!share))
        })
        .catch((error) => {
            dispatch(getUserProductPermissionsFailure(id, {
                message: error.message,
            }))
        })
}

export const startExternalLogin: ReduxActionCreator = createAction(EXTERNAL_LOGIN_START)
export const endExternalLogin: ReduxActionCreator = createAction(EXTERNAL_LOGIN_END)
