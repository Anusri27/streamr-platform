import assert from 'assert-diff'
import { normalize } from 'normalizr'

import * as all from '../../../../src/modules/productList/selectors'
import { productsSchema } from '../../../../src/modules/entities/schema'

import { initialState } from '../../../../src/modules/productList/reducer'
import { productListPageSize } from '../../../../src/utils/constants'

const products = [
    {
        id: '123abc',
        name: 'Test 1',
    },
    {
        id: '456def',
        name: 'Test 2',
    },
    {
        id: '789ghi',
        name: 'Test 3',
    },
]

const normalized = normalize(products, productsSchema)

const state = {
    test: true,
    productList: {
        ...initialState,
        ids: normalized.result,
    },
    entities: normalized.entities,
}

describe('productList - selectors', () => {
    it('selects fetching product list status', () => {
        assert.deepEqual(all.selectFetchingProductList(state), false)
    })

    it('selects product list ids', () => {
        assert.deepEqual(all.selectProductListIds(state), state.productList.ids)
    })

    it('selects product list', () => {
        assert.deepEqual(all.selectProductList(state), products)
    })

    it('selects filter', () => {
        assert.deepEqual(all.selectFilter(state), state.productList.filter)
    })

    it('selects error', () => {
        assert.deepEqual(all.selectProductListError(state), null)
    })

    it('selects page size', () => {
        assert.deepEqual(all.selectPageSize(state), productListPageSize)
    })

    it('selects offset', () => {
        assert.deepEqual(all.selectOffset(state), state.productList.offset)
    })

    it('selects has more results', () => {
        assert.deepEqual(all.selectHasMoreSearchResults(state), false)
    })
})
