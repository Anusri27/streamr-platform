import * as constants from '../../../../src/marketplace/modules/productList/constants'

describe('productList - constants', () => {
    it('is namespaced correctly', () => {
        Object.keys(constants).forEach((key) => {
            expect(constants[key]).toEqual(expect.stringMatching(/^marketplace\/productList\//))
        })
    })
})
