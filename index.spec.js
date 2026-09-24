jest.mock('./server')

describe('index.js', () => {
  let processExitSpy
  let consoleLogSpy

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {})
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    processExitSpy.mockRestore()
    consoleLogSpy.mockRestore()
  })

  it('should create and start the server', async () => {
    const createServer = require('./server')
    const start = jest.fn().mockResolvedValue()
    createServer.mockResolvedValue({ start })

    require('./index')
    await new Promise(process.nextTick)

    expect(createServer).toHaveBeenCalledTimes(1)
    expect(start).toHaveBeenCalledTimes(1)
    expect(processExitSpy).not.toHaveBeenCalled()
  })

  it('should log the error and exit when the server fails to start', async () => {
    const createServer = require('./server')
    const error = new Error('server failed to start')
    createServer.mockRejectedValue(error)

    require('./index')
    await new Promise(process.nextTick)

    expect(consoleLogSpy).toHaveBeenCalledWith(error)
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })
})
