describe('Frontpage', () => {
    let page
    beforeAll(async () => {
        page = await global.BROWSER.newPage()
        await global.LOGIN(page, 'http://localhost:3333/products/7a1d4e8cee6e41b0c304fd13d52f6434e39c7be5fd7ae158fc503b6ef71e4741')
    })

    afterAll(async () => {
        await page.close()
    })

    it('go to product edit', async () => {
        await page.click('.toolbar_buttons > a[href$="edit"]')
        expect(page.url()).toContain('/edit')
    })
})
