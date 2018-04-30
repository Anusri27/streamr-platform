// @flow

import BN from 'bignumber.js'
import { createAction } from 'redux-actions'
import { normalize } from 'normalizr'
import { push } from 'react-router-redux'

import { productSchema, streamsSchema } from '../entities/schema'
import { updateEntities } from '../entities/actions'
import { formatPath } from '../../utils/url'
import links from '../../links'
import { addFreeProduct } from '../purchase/actions'
import { getMyPurchases } from '../myPurchaseList/actions'
import type { StreamIdList } from '../../flowtype/stream-types'
import type { ProductId, Subscription } from '../../flowtype/product-types'
import type { ErrorInUi } from '../../flowtype/common-types'
import type { StoreState } from '../../flowtype/store-state'

import { selectProduct } from './selectors'
import {
    GET_PRODUCT_BY_ID_REQUEST,
    GET_PRODUCT_BY_ID_SUCCESS,
    GET_PRODUCT_BY_ID_FAILURE,
    GET_STREAMS_BY_PRODUCT_ID_REQUEST,
    GET_STREAMS_BY_PRODUCT_ID_SUCCESS,
    GET_STREAMS_BY_PRODUCT_ID_FAILURE,
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_REQUEST,
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_SUCCESS,
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_FAILURE,
} from './constants'
import * as services from './services'
import type {
    ProductIdActionCreator,
    ProductErrorActionCreator,
    StreamIdsByProductIdActionCreator,
    ProductSubscriptionActionCreator,
} from './types'

export const getProductByIdRequest: ProductIdActionCreator = createAction(
    GET_PRODUCT_BY_ID_REQUEST,
    (id: ProductId) => ({
        id,
    }),
)

export const getProductByIdSuccess: ProductIdActionCreator = createAction(
    GET_PRODUCT_BY_ID_SUCCESS,
    (id: ProductId) => ({
        id,
    }),
)

export const getProductByIdFailure: ProductErrorActionCreator = createAction(
    GET_PRODUCT_BY_ID_FAILURE,
    (id: ProductId, error: ErrorInUi) => ({
        id,
        error,
    }),
)

export const getStreamsByProductIdRequest: ProductIdActionCreator = createAction(
    GET_STREAMS_BY_PRODUCT_ID_REQUEST,
    (id: ProductId) => ({
        id,
    }),
)

export const getStreamsByProductIdSuccess: StreamIdsByProductIdActionCreator = createAction(
    GET_STREAMS_BY_PRODUCT_ID_SUCCESS,
    (id: ProductId, streams: StreamIdList) => ({
        id,
        streams,
    }),
)

export const getStreamsByProductIdFailure: ProductErrorActionCreator = createAction(
    GET_STREAMS_BY_PRODUCT_ID_FAILURE,
    (id: ProductId, error: ErrorInUi) => ({
        id,
        error,
    }),
)

export const getProductSubscriptionFromContractRequest: ProductIdActionCreator = createAction(
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_REQUEST,
    (id: ProductId) => ({
        id,
    }),
)

export const getProductSubscriptionFromContractSuccess: ProductSubscriptionActionCreator = createAction(
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_SUCCESS,
    (id: ProductId, subscription: Subscription) => ({
        id,
        subscription,
    }),
)

export const getProductSubscriptionFromContractFailure: ProductErrorActionCreator = createAction(
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_FAILURE,
    (id: ProductId, error: ErrorInUi) => ({
        id,
        error,
    }),
)

export const handleEntities = (schema: any, dispatch: Function) => (data: any) => {
    const { result, entities } = normalize(data, schema)
    dispatch(updateEntities(entities))
    return result
}

export const getStreamsByProductId = (id: ProductId) => (dispatch: Function) => {
    dispatch(getStreamsByProductIdRequest(id))
    return services
        .getStreamsByProductId(id)
        .then(handleEntities(streamsSchema, dispatch))
        .then((result) => dispatch(getStreamsByProductIdSuccess(id, result)))
        .catch((error) => dispatch(getStreamsByProductIdFailure(id, error)))
}

const fetchProductStreams = (id: ProductId, getState: () => StoreState, dispatch: Function) => () => {
    const product = selectProduct(getState())
    if (product && product.streams) {
        dispatch(getStreamsByProductId(id))
    }
}

export const getProductById = (id: ProductId) => (dispatch: Function, getState: () => StoreState) => {
    dispatch(getProductByIdRequest(id))
    return services
        .getProductById(id)
        .then(handleEntities(productSchema, dispatch))
        .then((result) => dispatch(getProductByIdSuccess(result)))
        .then(fetchProductStreams(id, getState, dispatch))
        .catch((error) => dispatch(getProductByIdFailure(id, error)))
}

export const getProductSubscription = (id: ProductId) => (dispatch: Function) => {
    dispatch(getProductSubscriptionFromContractRequest(id))
    return dispatch(getMyPurchases)
        .then(() => (
            services
                .getMyProductSubscription(id)
                .then(
                    (result) => dispatch(getProductSubscriptionFromContractSuccess(id, result)),
                    (error) => (
                        dispatch(getProductSubscriptionFromContractFailure(id, {
                            message: error.message,
                        }))
                    ),
                )
        ))
}

export const purchaseProduct = () => (dispatch: Function, getState: () => StoreState) => {
    const state = getState()
    const product = selectProduct(state)

    if (product) {
        if (BN(product.pricePerSecond).isGreaterThan(0)) {
            // Paid product has to be bought with Metamask
            dispatch(push(formatPath(links.products, product.id || '', 'purchase')))
                .then(() => dispatch(getMyPurchases))
        } else {
            // Free product can be bought directly
            dispatch(addFreeProduct(product.id || ''))
                .then(() => dispatch(getMyPurchases))
        }
    }
}
