describe('proxyDebug', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  it('returns true when proxy debugging is enabled', () => {
    process.env.PROXY_DEBUG = 'true'

    const { isEnabled } = require('./proxyDebug')

    expect(isEnabled()).toBe(true)
  })

  it('returns false when proxy debugging is disabled', () => {
    process.env.PROXY_DEBUG = 'false'

    const { isEnabled } = require('./proxyDebug')

    expect(isEnabled()).toBe(false)
  })

  it('logs messages only when debug is enabled', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    process.env.PROXY_DEBUG = 'true'

    const { logDebug } = require('./proxyDebug')

    logDebug('hello world', { status: 'ok' })
    logDebug('plain message')

    expect(consoleSpy).toHaveBeenNthCalledWith(1, '[proxy-debug] hello world {"status":"ok"}')
    expect(consoleSpy).toHaveBeenNthCalledWith(2, '[proxy-debug] plain message')

    consoleSpy.mockClear()
    process.env.PROXY_DEBUG = 'false'

    logDebug('hidden message', { status: 'nope' })

    expect(consoleSpy).not.toHaveBeenCalled()
  })
})
