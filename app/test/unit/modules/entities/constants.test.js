import * as constants from '../../../../src/marketplace/modules/entities/constants'

describe('entities - constants', () => {
    it('is namespaced correctly', () => {
        Object.keys(constants).forEach((key) => {
            expect(constants[key]).toEqual(expect.stringMatching(/^marketplace\/entities\//))
        })
    })
})
