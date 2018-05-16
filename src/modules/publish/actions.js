// @flow

import { createAction } from 'redux-actions'
import { normalize } from 'normalizr'
import { getLocation } from 'react-router-redux'

import { productSchema, myProductSchema } from '../entities/schema'
import { updateEntities } from '../entities/actions'
import { showNotification, showTransactionNotification } from '../notifications/actions'
import { notificationIcons } from '../../utils/constants'
import { getProductById } from '../product/actions'
import type { Hash, Receipt } from '../../flowtype/web3-types'
import type { ProductId } from '../../flowtype/product-types'
import type { ErrorInUi } from '../../flowtype/common-types'
import type { StoreState } from '../../flowtype/store-state'

import * as services from './services'
import {
    DEPLOY_PRODUCT_REQUEST,
    RECEIVE_DEPLOY_PRODUCT_HASH,
    DEPLOY_PRODUCT_SUCCESS,
    DEPLOY_PRODUCT_FAILURE,
    POST_DEPLOY_FREE_PRODUCT_REQUEST,
    POST_DEPLOY_FREE_PRODUCT_SUCCESS,
    POST_DEPLOY_FREE_PRODUCT_FAILURE,
    POST_UNDEPLOY_FREE_PRODUCT_REQUEST,
    POST_UNDEPLOY_FREE_PRODUCT_SUCCESS,
    POST_UNDEPLOY_FREE_PRODUCT_FAILURE,
    SET_PRODUCT_DEPLOYING_REQUEST,
    SET_PRODUCT_DEPLOYING_SUCCESS,
    SET_PRODUCT_DEPLOYING_FAILURE,
} from './constants'
import type {
    PublishActionCreator,
    ProductIdActionCreator,
    PublishErrorActionCreator,
    HashActionCreator,
    ReceiptActionCreator,
} from './types'

const FIVE_SECONDS = 5000

export const deployProductRequest: PublishActionCreator = createAction(
    DEPLOY_PRODUCT_REQUEST,
    (productId: ProductId, isPublish: boolean) => ({
        productId,
        isPublish,
    }),
)

export const deployProductSuccess: ReceiptActionCreator = createAction(
    DEPLOY_PRODUCT_SUCCESS,
    (receipt: Receipt) => ({
        receipt,
    }),
)

export const receiveDeployProductHash: HashActionCreator = createAction(
    RECEIVE_DEPLOY_PRODUCT_HASH,
    (hash: Hash) => ({
        hash,
    }),
)

export const deployProductFailure: PublishErrorActionCreator = createAction(
    DEPLOY_PRODUCT_FAILURE,
    (id: ProductId, error: ErrorInUi) => ({
        id,
        error,
    }),
)

export const postDeployFreeProductRequest: ProductIdActionCreator = createAction(
    POST_DEPLOY_FREE_PRODUCT_REQUEST,
    (id: ProductId) => ({
        id,
    }),
)

export const postDeployFreeProductSuccess: ProductIdActionCreator = createAction(
    POST_DEPLOY_FREE_PRODUCT_SUCCESS,
    (id: ProductId) => ({
        id,
    }),
)

export const postDeployFreeProductFailure: PublishErrorActionCreator = createAction(
    POST_DEPLOY_FREE_PRODUCT_FAILURE,
    (id: ProductId, error: ErrorInUi) => ({
        id,
        error,
    }),
)

export const postUndeployFreeProductRequest: ProductIdActionCreator = createAction(
    POST_UNDEPLOY_FREE_PRODUCT_REQUEST,
    (id: ProductId) => ({
        id,
    }),
)

export const postUndeployFreeProductSuccess: ProductIdActionCreator = createAction(
    POST_UNDEPLOY_FREE_PRODUCT_SUCCESS,
    (id: ProductId) => ({
        id,
    }),
)

export const postUndeployFreeProductFailure: PublishErrorActionCreator = createAction(
    POST_UNDEPLOY_FREE_PRODUCT_FAILURE,
    (id: ProductId, error: ErrorInUi) => ({
        id,
        error,
    }),
)

export const setProductDeployingRequest: ProductIdActionCreator = createAction(
    SET_PRODUCT_DEPLOYING_REQUEST,
    (id: ProductId) => ({
        id,
    }),
)

export const setProductDeployingSuccess: ProductIdActionCreator = createAction(
    SET_PRODUCT_DEPLOYING_SUCCESS,
    (id: ProductId) => ({
        id,
    }),
)

export const setProductDeployingFailure: PublishErrorActionCreator = createAction(
    SET_PRODUCT_DEPLOYING_FAILURE,
    (id: ProductId, error: ErrorInUi) => ({
        id,
        error,
    }),
)

const handleEntities = (schema: any, dispatch: Function) => (data) => {
    const { result, entities } = normalize(data, schema)
    dispatch(updateEntities(entities))
    return result
}

export const deployFreeProduct = (id: ProductId) => (dispatch: Function) => {
    dispatch(postDeployFreeProductRequest(id))
    return services.postDeployFree(id)
        .then((data) => {
            const { entities: productEntities } = normalize(data, productSchema)
            dispatch(updateEntities(productEntities))
            const { entities: myProductEntities } = normalize(data, myProductSchema)
            dispatch(updateEntities(myProductEntities))
        })
        .then(() => {
            dispatch(postDeployFreeProductSuccess(id))
            dispatch(showNotification('Your product has been published', notificationIcons.CHECKMARK))
        })
        .catch((error) => dispatch(postDeployFreeProductFailure(id, {
            message: error.message,
        })))
}

export const undeployFreeProduct = (id: ProductId) => (dispatch: Function) => {
    dispatch(postUndeployFreeProductRequest(id))
    return services.postUndeployFree(id)
        .then((data) => {
            const { entities: productEntities } = normalize(data, productSchema)
            dispatch(updateEntities(productEntities))
            const { entities: myProductEntities } = normalize(data, myProductSchema)
            dispatch(updateEntities(myProductEntities))
        })
        .then(() => {
            dispatch(postUndeployFreeProductSuccess(id))
            dispatch(showNotification('Your product has been unpublished', notificationIcons.CHECKMARK))
        })
        .catch((error) => dispatch(postUndeployFreeProductFailure(id, error)))
}

export const setProductDeploying = (id: ProductId, txHash: Hash) => (dispatch: Function) => {
    dispatch(setProductDeployingRequest(id))
    return services.postSetDeploying(id, txHash)
        .then(handleEntities(productSchema, dispatch))
        .then(() => dispatch(setProductDeployingSuccess(id)))
        .catch((error) => dispatch(setProductDeployingFailure(id, {
            message: error.message,
        })))
}

export const setProductUndeploying = (id: ProductId, txHash: Hash) => (dispatch: Function) => {
    dispatch(setProductDeployingRequest(id))
    return services.postSetUndeploying(id, txHash)
        .then(handleEntities(productSchema, dispatch))
        .then(() => dispatch(setProductDeployingSuccess(id)))
        .catch((error) => dispatch(setProductDeployingFailure(id, {
            message: error.message,
        })))
}

export const redeployProduct = (productId: ProductId) => (dispatch: Function, getState: () => StoreState) => {
    dispatch(deployProductRequest(productId, true))

    return services
        .redeployProduct(productId)
        .onTransactionHash((hash) => {
            dispatch(receiveDeployProductHash(hash))
            dispatch(showTransactionNotification(hash))
            dispatch(setProductDeploying(productId, hash))
        })
        .onTransactionComplete((receipt) => {
            // Call `getProductById()` with a timeout to allow the ethereum watcher to do its job.
            // At the moment, this the only way to get the UI to update after the transaction completes.
            setTimeout(() => {
                const location = getLocation(getState())

                // Do call only if we are still in product page.
                if (location.pathname.includes(productId)) {
                    dispatch(getProductById(productId))
                }
            }, FIVE_SECONDS)

            dispatch(deployProductSuccess(receipt))
        })
        .onError((error) => dispatch(deployProductFailure(productId, {
            message: error.message,
        })))
}

export const deleteProduct = (productId: ProductId) => (dispatch: Function, getState: () => StoreState) => {
    dispatch(deployProductRequest(productId, false))

    return services
        .deleteProduct(productId)
        .onTransactionHash((hash) => {
            dispatch(receiveDeployProductHash(hash))
            dispatch(showTransactionNotification(hash))
            dispatch(setProductUndeploying(productId, hash))
        })
        .onTransactionComplete((receipt) => {
            // Call `getProductById()` with a timeout to allow the ethereum watcher to do its job.
            // At the moment, this the only way to get the UI to update after the transaction completes.
            setTimeout(() => {
                const location = getLocation(getState())

                // Do call only if we are still in product page.
                if (location.pathname.includes(productId)) {
                    dispatch(getProductById(productId))
                }
            }, FIVE_SECONDS)

            dispatch(deployProductSuccess(receipt))
        })
        .onError((error) => dispatch(deployProductFailure(productId, {
            message: error.message,
        })))
}
