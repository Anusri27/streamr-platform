import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'

import { TimeUnitButton } from '../../../../../src/components/Modal/SetPriceDialog/TimeUnitButton/index'

describe('TimeUnitButton', () => {
    let sandbox

    beforeEach(() => {
        sandbox = sinon.createSandbox()
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('render', () => {
        it('selected TimeUnitButton has an active class', () => {
            const wrapper = shallow(<TimeUnitButton
                value="hour"
                className=""
                active
                translate={() => {}}
            />)

            expect(wrapper.find('div').hasClass('active')).toEqual(true)
        })
    })
})
