// @flow

import { createAction } from 'redux-actions'
import { normalize } from 'normalizr'
import { streamsSchema } from '../../modules/entities/schema'
import { updateEntities } from '../../modules/entities/actions'
import * as api from './services'

import {
    GET_STREAMS_REQUEST,
    GET_STREAMS_SUCCESS,
    GET_STREAMS_FAILURE,
} from './constants'
import type {
    StreamsActionCreator,
    StreamsErrorActionCreator,
} from './types'
import type { StreamList } from '../../flowtype/stream-types'
import type { ErrorInUi, ReduxActionCreator } from '../../flowtype/common-types'

export const getStreamsRequest: ReduxActionCreator = createAction(GET_STREAMS_REQUEST)

export const gettreamsSuccess: StreamsActionCreator = createAction(GET_STREAMS_SUCCESS, (streams: StreamList) => ({
    streams,
}))

export const getStreamsFailure: StreamsErrorActionCreator = createAction(GET_STREAMS_FAILURE, (error: ErrorInUi) => ({
    error,
}))

export const getStreams = () => (dispatch: Function) => {
    dispatch(getStreamsRequest())
    return api.getStreams()
        .then((data) => {
            const { result, entities } = normalize(data, streamsSchema)

            dispatch(updateEntities(entities))
            dispatch(gettreamsSuccess(result))
        })
        .catch((error) => dispatch(getStreamsFailure(error)))
}
