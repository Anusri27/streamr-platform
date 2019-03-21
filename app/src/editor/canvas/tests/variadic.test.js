import * as State from '../state'
import * as Services from '../services'
import { loadModuleDefinition, setup } from './utils'

describe('Variadic Port Handling', () => {
    let teardown

    beforeAll(async () => {
        teardown = await setup(Services.API)
    }, 60000)

    afterAll(async () => {
        await teardown()
    })

    describe('Variadic Inputs', () => {
        let Clock
        let Table

        beforeAll(async () => {
            Clock = await loadModuleDefinition('Clock')
            Table = await loadModuleDefinition('Table')
            expect(Clock).toHaveProperty('id')
            expect(Table).toHaveProperty('id')
        })

        it('can add/remove variadic inputs as connections added/removed', () => {
            // connect clock to a table (table has variadic inputs)
            let canvas = State.emptyCanvas()
            canvas = State.addModule(canvas, Clock)
            canvas = State.addModule(canvas, Table)
            const clock = canvas.modules.find((m) => m.name === 'Clock')
            const table = canvas.modules.find((m) => m.name === 'Table')
            expect(clock).toBeTruthy()
            expect(table).toBeTruthy()
            expect(clock.hash).not.toEqual(table.hash)
            const fromPort = State.findModulePort(canvas, clock.hash, (p) => p.name === 'timestamp')
            const toPort = State.findModulePort(canvas, table.hash, (p) => p.variadic.index === 1)
            expect(fromPort).toBeTruthy()
            expect(toPort).toBeTruthy()

            canvas = State.updateCanvas(State.connectPorts(canvas, fromPort.id, toPort.id))
            expect(State.isPortConnected(canvas, fromPort.id)).toBeTruthy()
            expect(State.isPortConnected(canvas, toPort.id)).toBeTruthy()

            // check a new input is created
            const newVariadicInput = State.findModulePort(canvas, table.hash, (p) => p.variadic.index === 2)
            expect(newVariadicInput).toBeTruthy()
            // new input is last
            expect(newVariadicInput.variadic.isLast).toBeTruthy()
            // new input is not connected
            expect(State.isPortConnected(canvas, newVariadicInput.id)).not.toBeTruthy()
            let firstVariadicPort = State.findModulePort(canvas, table.hash, (p) => p.variadic.index === 1)
            // first is not last
            expect(firstVariadicPort.variadic.isLast).not.toBeTruthy()

            // disconnecting should remove new input
            canvas = State.updateCanvas(State.disconnectPorts(canvas, fromPort.id, toPort.id))

            // check new input is gone
            expect(State.findModulePort(canvas, table.hash, (p) => p.variadic.index === 2)).toBeUndefined()

            firstVariadicPort = State.findModulePort(canvas, table.hash, (p) => p.variadic.index === 1)
            expect(firstVariadicPort).toBeTruthy()

            // first is now last
            expect(firstVariadicPort.variadic.isLast).toBeTruthy()
        })
    })
})
