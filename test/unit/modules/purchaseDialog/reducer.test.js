import assert from 'assert-diff'

import reducer, { initialState } from '../../../../src/modules/purchaseDialog/reducer'
import * as constants from '../../../../src/modules/purchaseDialog/constants'
import { RECEIVE_SET_ALLOWANCE_HASH } from '../../../../src/modules/allowance/constants'
import { RECEIVE_PURCHASE_HASH } from '../../../../src/modules/purchase/constants'

describe('purchaseDialog - reducer', () => {
    const productId = '12345'

    it('has initial state', () => {
        assert.deepEqual(reducer(undefined, {}), initialState)
    })

    it('initializes a purchase', () => {
        const expectedState = {
            productId,
            data: null,
            step: 'accessPeriod',
        }

        assert.deepStrictEqual(reducer(undefined, {
            type: constants.INIT_PURCHASE,
            payload: {
                id: productId,
            },
        }), expectedState)
    })

    it('handles SET_STEP action (sets the correct step)', () => {
        const expectedState = {
            productId: null,
            data: null,
            step: 'allowance',
        }

        assert.deepStrictEqual(reducer(undefined, {
            type: constants.SET_STEP,
            payload: {
                step: 'allowance',
            },
        }), expectedState)
    })

    it('handles SET_ACCESS_PERIOD action', () => {
        const expectedState = {
            productId: null,
            data: {
                time: '1',
                timeUnit: 'day',
            },
            step: 'accessPeriod',
        }

        assert.deepStrictEqual(reducer(undefined, {
            type: constants.SET_ACCESS_PERIOD,
            payload: {
                time: '1',
                timeUnit: 'day',
            },
        }), expectedState)
    })

    it('handles RECEIVE_SET_ALLOWANCE_HASH action', () => {
        const expectedState = {
            productId: null,
            data: null,
            step: 'summary',
        }

        assert.deepStrictEqual(reducer(undefined, {
            type: RECEIVE_SET_ALLOWANCE_HASH,
            payload: {},
        }), expectedState)
    })

    it('handles RECEIVE_PURCHASE_HASH action', () => {
        const expectedState = {
            productId: null,
            data: null,
            step: 'complete',
        }

        assert.deepStrictEqual(reducer(undefined, {
            type: RECEIVE_PURCHASE_HASH,
        }), expectedState)
    })
})

