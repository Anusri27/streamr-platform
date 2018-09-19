import assert from 'assert-diff'
import sinon from 'sinon'

import mockStore from '../../../test-utils/mockStoreProvider'
import * as actions from '../../../../src/marketplace/modules/publishDialog/actions'
import * as constants from '../../../../src/marketplace/modules/publishDialog/constants'
import * as selectors from '../../../../src/marketplace/modules/publishDialog/selectors'
import * as contractProductSelectors from '../../../../src/marketplace/modules/contractProduct/selectors'
import * as createContractProductActions from '../../../../src/marketplace/modules/createContractProduct/actions'
import * as publishActions from '../../../../src/marketplace/modules/publish/actions'
import * as globalConstants from '../../../../src/marketplace/utils/constants'

describe('publishDialog - actions', () => {
    let sandbox

    beforeEach(() => {
        sandbox = sinon.createSandbox()
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('initPublish', () => {
        it('produces a correct-looking object', () => {
            const id = 'test'
            assert.deepStrictEqual(actions.initPublish(id), {
                type: constants.INIT_PUBLISH,
                payload: {
                    id,
                },
            })
        })
    })

    describe('publishOrCreateProduct', () => {
        it('does nothing if there is no product', () => {
            sandbox.stub(selectors, 'selectProduct').callsFake(() => null)
            const store = mockStore()
            store.dispatch(actions.publishOrCreateProduct())
            const expectedActions = []
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })

        it('dispatches correct actions with a paid unpublished product', () => {
            const product = {
                id: '0x42',
                name: 'foo',
                ownerAddress: '0x416170656c69204861616e7075750a',
                beneficiaryAddress: '0x4f6e207061726173',
                pricePerSecond: '1337',
                priceCurrency: 'USD',
                minimumSubscriptionInSeconds: 1000,
                state: 'DEPLOYED',
            }
            sandbox.stub(selectors, 'selectProduct').callsFake(() => product)
            sandbox.stub(contractProductSelectors, 'selectContractProduct').callsFake(() => null)
            sandbox.stub(createContractProductActions, 'createContractProduct')
                .callsFake((id, p) => ({
                    type: 'createContractProduct',
                    id,
                    product: p,
                }))
            const store = mockStore()
            store.dispatch(actions.publishOrCreateProduct())
            const expectedActions = [{
                type: 'createContractProduct',
                id: product.id,
                product,
            }, {
                type: constants.SET_STEP,
                payload: {
                    step: globalConstants.publishFlowSteps.CREATE_PRODUCT,
                },
            }]
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })

        it('dispatches correct actions with a paid and already published product', () => {
            const product = {
                id: '0x42',
                name: 'foo',
                ownerAddress: '0x416170656c69204861616e7075750a',
                beneficiaryAddress: '0x4f6e207061726173',
                pricePerSecond: '1337',
                priceCurrency: 'USD',
                minimumSubscriptionInSeconds: 1000,
                state: 'DEPLOYED',
            }
            sandbox.stub(selectors, 'selectProduct').callsFake(() => product)
            sandbox.stub(contractProductSelectors, 'selectContractProduct').callsFake(() => product)
            sandbox.stub(publishActions, 'redeployProduct')
                .callsFake((id) => ({
                    type: 'redeployProduct',
                    id,
                }))
            const store = mockStore()
            store.dispatch(actions.publishOrCreateProduct())
            const expectedActions = [{
                type: 'redeployProduct',
                id: product.id,
            }, {
                type: constants.SET_STEP,
                payload: {
                    step: globalConstants.publishFlowSteps.PUBLISH,
                },
            }]
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })

        it('dispatches correct actions with a free product', () => {
            const product = {
                id: '0x42',
                name: 'foo',
                ownerAddress: '0x416170656c69204861616e7075750a',
                beneficiaryAddress: '0x4f6e207061726173',
                pricePerSecond: '0',
                priceCurrency: 'USD',
                minimumSubscriptionInSeconds: 1000,
                state: 'DEPLOYED',
            }
            sandbox.stub(selectors, 'selectProduct').callsFake(() => product)
            sandbox.stub(contractProductSelectors, 'selectContractProduct').callsFake(() => null)
            sandbox.stub(publishActions, 'deployFreeProduct')
                .callsFake((id) => ({
                    type: 'deployFreeProduct',
                    id,
                }))
            const store = mockStore()
            store.dispatch(actions.publishOrCreateProduct())
            const expectedActions = [{
                type: 'deployFreeProduct',
                id: product.id,
            }, {
                type: constants.SET_STEP,
                payload: {
                    step: globalConstants.publishFlowSteps.PUBLISH,
                },
            }]
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })
    })

    describe('unpublishProduct', () => {
        it('does nothing if there is no product', () => {
            sandbox.stub(selectors, 'selectProduct').callsFake(() => null)
            const store = mockStore()
            store.dispatch(actions.unpublishProduct())
            const expectedActions = []
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })

        it('dispatches correct actions with a paid product', () => {
            const product = {
                id: '0x42',
                name: 'foo',
                ownerAddress: '0x416170656c69204861616e7075750a',
                beneficiaryAddress: '0x4f6e207061726173',
                pricePerSecond: '1337',
                priceCurrency: 'USD',
                minimumSubscriptionInSeconds: 1000,
                state: 'DEPLOYED',
            }
            sandbox.stub(selectors, 'selectProduct').callsFake(() => product)
            sandbox.stub(publishActions, 'deleteProduct')
                .callsFake((id) => ({
                    type: 'deleteProduct',
                    id,
                }))
            const store = mockStore()
            store.dispatch(actions.unpublishProduct())
            const expectedActions = [{
                type: 'deleteProduct',
                id: product.id,
            }, {
                type: constants.SET_STEP,
                payload: {
                    step: globalConstants.publishFlowSteps.PUBLISH,
                },
            }]
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })

        it('dispatches correct actions with a paid product', () => {
            const product = {
                id: '0x42',
                name: 'foo',
                ownerAddress: '0x416170656c69204861616e7075750a',
                beneficiaryAddress: '0x4f6e207061726173',
                pricePerSecond: '0',
                priceCurrency: 'USD',
                minimumSubscriptionInSeconds: 1000,
                state: 'DEPLOYED',
            }
            sandbox.stub(selectors, 'selectProduct').callsFake(() => product)
            sandbox.stub(publishActions, 'undeployFreeProduct')
                .callsFake((id) => ({
                    type: 'undeployFreeProduct',
                    id,
                }))
            const store = mockStore()
            store.dispatch(actions.unpublishProduct())
            const expectedActions = [{
                type: 'undeployFreeProduct',
                id: product.id,
            }, {
                type: constants.SET_STEP,
                payload: {
                    step: globalConstants.publishFlowSteps.PUBLISH,
                },
            }]
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })
    })
})
