import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'
import assert from 'assert-diff'
import { replace } from 'react-router-redux'

import { PublishOrUnpublishDialog, mapStateToProps, mapDispatchToProps } from '../../../../../src/containers/ProductPage/PublishOrUnpublishDialog/index'
import { productStates } from '../../../../../src/utils/constants'
import UnpublishDialog from '../../../../../src/containers/ProductPage/PublishOrUnpublishDialog/UnpublishDialog/index'
import PublishDialog from '../../../../../src/containers/ProductPage/PublishOrUnpublishDialog/PublishDialog/index'

import * as publishDialogActions from '../../../../../src/modules/publishDialog/actions'
import * as contractProductActions from '../../../../../src/modules/contractProduct/actions'

describe('PublishOrUnpublishDialog', () => {
    let wrapper
    let sandbox

    beforeEach(() => {
        sandbox = sinon.createSandbox()
    })

    afterEach(() => {
        sandbox.restore()
    })

    it('renders correctly in DEPLOYED state', () => {
        const props = {
            product: {
                state: productStates.DEPLOYED,
            },
            initPublish: () => {},
        }

        wrapper = shallow(<PublishOrUnpublishDialog {...props} />)
        expect(wrapper.find(UnpublishDialog).length).toEqual(1)
    })

    it('renders correctly in other states', () => {
        const props = {
            product: {
                state: productStates.DEPLOYING,
            },
            initPublish: () => {},
        }

        wrapper = shallow(<PublishOrUnpublishDialog {...props} />)
        expect(wrapper.find(PublishDialog).length).toEqual(1)
    })

    it('maps state to props', () => {
        const state = {}
        const expectedProps = {}
        assert.deepStrictEqual(mapStateToProps(state), expectedProps)
    })

    it('maps actions to props', () => {
        sandbox.stub(contractProductActions, 'getProductFromContract').callsFake(() => 'getProductFromContract')
        sandbox.stub(publishDialogActions, 'initPublish').callsFake(() => 'initPublish')

        const ownProps = {
            redirectOnCancel: true,
            productId: 'product-1',
        }
        const dispatchStub = sandbox.stub().callsFake((action) => action)
        const actions = mapDispatchToProps(dispatchStub, ownProps)

        const result = {
            getProductFromContract: actions.getProductFromContract(ownProps.productId),
            initPublish: actions.initPublish(ownProps.productId),
            onCancel: actions.onCancel(),
            redirectBackToProduct: actions.redirectBackToProduct(ownProps.productId),
        }
        const expectedResult = {
            getProductFromContract: 'getProductFromContract',
            initPublish: 'initPublish',
            onCancel: replace('/products/product-1'),
            redirectBackToProduct: replace('/products/product-1'),
        }

        assert.deepStrictEqual(result, expectedResult)
        expect(dispatchStub.callCount).toEqual(Object.keys(expectedResult).length)
    })

    it('reacts to contract product state changes', () => {
        const props = {
            product: {
                state: productStates.DEPLOYED,
            },
            contractProduct: {
                state: productStates.DEPLOYED,
            },
            initPublish: () => {},
        }

        wrapper = shallow(<PublishOrUnpublishDialog {...props} />)
        expect(wrapper.state('startingState')).toEqual(productStates.DEPLOYED)

        wrapper.setProps({
            product: {
                state: productStates.NOT_DEPLOYED,
            },
            contractProduct: {
                state: productStates.NOT_DEPLOYED,
            },
        })
        expect(wrapper.state('startingState')).toEqual(productStates.NOT_DEPLOYED)
    })
})
