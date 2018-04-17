// @flow

import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'

import { productSchema } from '../entities/schema'
import { selectEntities } from '../entities/selectors'

import type { StoreState, PublishDialogState, EntitiesState, PublishStep } from '../../flowtype/store-state'

import type { ProductId, Product } from '../../flowtype/product-types'

const selectPublishState = (state: StoreState): PublishDialogState => state.publishDialog

export const selectStep: (StoreState) => PublishStep = createSelector(
    selectPublishState,
    (subState: PublishDialogState): PublishStep => subState.step,
)

export const selectProductId: (StoreState) => ?ProductId = createSelector(
    selectPublishState,
    (subState: PublishDialogState): ?ProductId => subState.productId,
)

export const selectProduct: (StoreState) => ?Product = createSelector(
    selectProductId,
    selectEntities,
    (id: ?ProductId, entities: EntitiesState): ?Product => denormalize(id, productSchema, entities),
)
