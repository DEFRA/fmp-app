describe('createServer logging registration', () => {
  let previousNoLog

  beforeEach(() => {
    previousNoLog = process.env.NOLOG
    jest.resetModules()
  })

  afterEach(() => {
    if (previousNoLog === undefined) {
      delete process.env.NOLOG
    } else {
      process.env.NOLOG = previousNoLog
    }
  })

  it('should not register logging plugin when NOLOG is set', async () => {
    process.env.NOLOG = 'true'
    const createServer = require('..')
    const server = await createServer()
    await server.initialize()
    const pluginNames = Object.keys(server.registrations)
    const hasPinoLogging = pluginNames.some((name) => name === 'hapi-pino' || name === 'logging')
    expect(hasPinoLogging).toEqual(false)
    await server.stop()
  })
})
