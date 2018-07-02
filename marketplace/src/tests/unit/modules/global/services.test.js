import assert from 'assert-diff'
import sinon from 'sinon'

import * as all from '../../../../modules/global/services'
import * as utils from '../../../../utils/smartContract'
import * as getWeb3 from '../../../../web3/web3Provider'

describe('Token services', () => {
    let sandbox
    beforeEach(() => {
        sandbox = sinon.sandbox.create()
    })

    afterEach(() => {
        sandbox.reset()
        sandbox.restore()
    })

    describe('getDataPerUsd', () => {
        it('must call the correct method', async () => {
            sandbox.stub(getWeb3, 'default').callsFake(() => ({
                getDefaultAccount: () => Promise.resolve('testAccount'),
            }))
            const balanceStub = sandbox.stub().callsFake(() => ({
                call: () => Promise.resolve('10000'),
            }))
            const getContractStub = sandbox.stub(utils, 'getContract').callsFake(() => ({
                methods: {
                    dataPerUsd: balanceStub,
                },
            }))
            await all.getDataPerUsd()
            assert(getContractStub.calledOnce)
            assert(getContractStub.getCall(0).args[0].abi.find((f) => f.name === 'dataPerUsd'))
            assert(balanceStub.calledOnce)
        })
        it('must transform the result from attoUnit to unit', async () => {
            sandbox.stub(getWeb3, 'default').callsFake(() => ({
                getDefaultAccount: () => Promise.resolve('testAccount'),
            }))
            const dataPerUsdStub = sandbox.stub().callsFake(() => ({
                call: () => Promise.resolve(('209000000000000000000').toString()),
            }))
            sandbox.stub(utils, 'getContract').callsFake(() => ({
                methods: {
                    dataPerUsd: dataPerUsdStub,
                },
            }))
            const result = await all.getDataPerUsd()
            assert.equal(209, result)
        })
    })
})
