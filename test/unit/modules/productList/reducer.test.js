import assert from 'assert-diff'

import reducer, { initialState } from '../../../../src/modules/productList/reducer'
import * as constants from '../../../../src/modules/productList/constants'

describe('productList - reducer', () => {
    it('has initial state', () => {
        assert.deepEqual(reducer(undefined, {}), initialState)
    })

    it('handles request', () => {
        const expectedState = {
            ...initialState,
            fetching: true,
        }

        assert.deepEqual(reducer(undefined, {
            type: constants.GET_PRODUCTS_REQUEST,
            payload: {},
        }), expectedState)
    })

    it('handles success', () => {
        const expectedState = {
            ...initialState,
            ids: [1, 2, 3],
            fetching: false,
            offset: 3,
            error: null,
            hasMoreSearchResults: false,
        }
        const reducerState = reducer(undefined, {
            type: constants.GET_PRODUCTS_SUCCESS,
            payload: {
                products: [1, 2, 3],
                hasMore: false,
            },
        })
        assert.deepEqual(reducerState, expectedState)
    })

    it('handles failure', () => {
        const error = new Error('Test')

        const expectedState = {
            ...initialState,
            ids: [],
            fetching: false,
            error: {},
        }

        const reducerState = reducer(undefined, {
            type: constants.GET_PRODUCTS_FAILURE,
            payload: {
                error,
            },
        })
        assert.deepEqual(reducerState, expectedState)
    })

    it('updates filter', () => {
        const expectedState = {
            ...initialState,
            filter: 'foo',
        }

        const reducerState = reducer(undefined, {
            type: constants.UPDATE_FILTER,
            payload: {
                filter: 'foo',
            },
        })
        assert.deepEqual(reducerState, expectedState)
    })

    it('clears filter', () => {
        const expectedState = {
            ...initialState,
        }

        const mockState = {
            ...initialState,
            filter: 'foo',
        }

        const reducerState = reducer(mockState, {
            type: constants.CLEAR_FILTERS,
        })

        assert.deepEqual(reducerState, expectedState)
    })

    it('clears product list', () => {
        const expectedState = {
            ...initialState,
            error: null,
            ids: [],
            offset: 0,
            hasMoreSearchResults: null,
        }

        const mockState = {
            ...initialState,
            error: {},
            ids: [1, 2, 3],
            offset: 2,
            hasMoreSearchResults: true,
        }

        const reducerState = reducer(mockState, {
            type: constants.CLEAR_PRODUCT_LIST,
        })

        assert.deepEqual(reducerState, expectedState)
    })
})
