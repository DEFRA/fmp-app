import { keepMapRefreshed } from './keepMapRefreshed'

const REFRESH_INTERVAL_MS = 10 * 60 * 1000

const setVisibility = (state) => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('keepMapRefreshed', () => {
  let addEventListenerSpy
  let logSpy

  beforeEach(() => {
    jest.useFakeTimers()
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 204 })
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    addEventListenerSpy = jest.spyOn(document, 'addEventListener')
  })

  afterEach(() => {
    // Remove the listeners added by each test so they don't fire in later tests
    addEventListenerSpy.mock.calls
      .filter(([type]) => type === 'visibilitychange')
      .forEach(([type, listener]) => document.removeEventListener(type, listener))
    jest.clearAllTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
    delete document.visibilityState
  })

  it('does not refresh immediately', () => {
    keepMapRefreshed()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('requests /map/refresh every 10 minutes', async () => {
    keepMapRefreshed()

    await jest.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS - 1)
    expect(global.fetch).not.toHaveBeenCalled()

    await jest.advanceTimersByTimeAsync(1)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith('/map/refresh', { cache: 'no-store', credentials: 'same-origin' })

    await jest.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS)
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('logs the status when the refresh response is not ok', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 })
    keepMapRefreshed()

    await jest.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS)

    expect(logSpy).toHaveBeenCalledWith('fmp refresh failed', 500)
  })

  it('logs the error when the refresh request fails', async () => {
    const error = new Error('network down')
    global.fetch.mockRejectedValue(error)
    keepMapRefreshed()

    await jest.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS)

    expect(logSpy).toHaveBeenCalledWith('fmp refresh failed', error)
  })

  it('refreshes immediately when the page becomes visible', async () => {
    keepMapRefreshed()

    setVisibility('visible')
    await jest.advanceTimersByTimeAsync(0)

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('does not refresh when the page becomes hidden', async () => {
    keepMapRefreshed()

    setVisibility('hidden')
    await jest.advanceTimersByTimeAsync(0)

    expect(global.fetch).not.toHaveBeenCalled()
  })
})
