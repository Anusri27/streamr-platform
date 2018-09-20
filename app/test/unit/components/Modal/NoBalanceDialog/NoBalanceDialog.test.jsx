import React from 'react'
import assert from 'assert-diff'
import { shallow } from 'enzyme'

import NoBalanceDialog from '$mp/components/Modal/NoBalanceDialog'
import GetCryptoDialog from '$mp/components/Modal/GetCryptoDialog'
import GetDataTokensDialog from '$mp/components/Modal/GetDataTokensDialog'

describe('NoBalanceDialog', () => {
    describe('render', () => {
        it('must render GetCryptoDialog when ETH balance is zero', async () => {
            const wrapper = shallow(<NoBalanceDialog hasEthBalance={false} onCancel={() => null} />)
            assert(wrapper.is(GetCryptoDialog))
        })

        it('must render GetDataTokensDialog when ETH balance is not zero', async () => {
            const wrapper = shallow(<NoBalanceDialog hasEthBalance onCancel={() => null} />)
            assert(wrapper.is(GetDataTokensDialog))
        })
    })
})
