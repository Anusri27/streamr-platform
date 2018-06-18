import assert from 'assert-diff'

import reducer, { initialState } from '../../../../src/modules/streams/reducer'
import * as constants from '../../../../src/modules/streams/constants'

describe('streams - reducer', () => {
    it('has initial state', () => {
        assert.deepEqual(reducer(undefined, {}), initialState)
    })

    it('handles request', () => {
        const expectedState = {
            ids: [],
            fetching: true,
            error: null,
        }

        assert.deepEqual(reducer(undefined, {
            type: constants.GET_STREAMS_REQUEST,
            payload: {},
        }), expectedState)
    })

    it('handles success', () => {
        const expectedState = {
            ids: [1, 2],
            fetching: false,
            error: null,
        }

        assert.deepEqual(reducer(undefined, {
            type: constants.GET_STREAMS_SUCCESS,
            payload: {
                streams: [1, 2],
            },
        }), expectedState)
    })

    it('handles failure', () => {
        const error = new Error('Test')

        const expectedState = {
            ids: [],
            fetching: false,
            error: {},
        }

        assert.deepEqual(reducer(undefined, {
            type: constants.GET_STREAMS_FAILURE,
            payload: {
                error,
            },
        }), expectedState)
    })
})
