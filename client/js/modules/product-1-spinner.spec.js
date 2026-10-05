const loadModule = () => {
  jest.resetModules()
  require('./product-1-spinner.js')
}

// Flushes both pending microtasks (fetch/blob promises) and fake timers
const flushPromises = () => jest.advanceTimersByTimeAsync(0)

describe('product-1-spinner', () => {
  let form
  let button
  let downloadFailed

  beforeEach(() => {
    jest.useFakeTimers()
    document.body.innerHTML = ''
    // jsdom logs this when clicking the anchor's fake blob: href, it's expected noise
    jest.spyOn(console, 'error').mockImplementation((err) => {
      if (err?.type === 'not implemented') {
        return
      }
      console.warn(err)
    })

    window.URL.createObjectURL = jest.fn().mockReturnValue('blob:fake-url')
    window.URL.revokeObjectURL = jest.fn()

    form = document.createElement('form')
    form.id = 'product-1-form'
    form.action = '/get-product-1'

    button = document.createElement('button')
    button.id = 'product-1-button'
    button.textContent = 'Download flood map for this location (PDF)'

    downloadFailed = document.createElement('div')
    downloadFailed.id = 'downloadP1Failed'
    downloadFailed.classList.add('hidden')

    form.appendChild(button)
    document.body.appendChild(form)
    document.body.appendChild(downloadFailed)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('should do nothing when there is no product-1 form on the page', () => {
    document.body.innerHTML = ''
    expect(() => loadModule()).not.toThrow()
  })

  it('should download the PDF and reset the button on a successful response', async () => {
    const blob = new window.Blob(['pdf-content'])
    window.fetch = jest.fn().mockResolvedValue({
      status: 200,
      blob: jest.fn().mockResolvedValue(blob)
    })
    loadModule()

    const submitEvent = new window.Event('submit', { cancelable: true })
    form.dispatchEvent(submitEvent)

    expect(submitEvent.defaultPrevented).toBe(true)
    expect(button.classList.contains('loading')).toBe(true)
    expect(button.textContent).toBe('We are preparing your PDF, please wait')
    expect(downloadFailed.classList.contains('hidden')).toBe(true)

    await flushPromises()

    expect(window.fetch).toHaveBeenCalledWith('http://localhost/get-product-1', expect.objectContaining({ method: 'POST' }))
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob)
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url')
    expect(button.classList.contains('loading')).toBe(false)
    expect(button.textContent).toBe('Download flood map for this location (PDF)')
  })

  it('should show the failure message when the response is not ok', async () => {
    window.fetch = jest.fn().mockResolvedValue({
      status: 500,
      blob: jest.fn()
    })
    loadModule()

    form.dispatchEvent(new window.Event('submit', { cancelable: true }))
    await flushPromises()

    expect(downloadFailed.classList.contains('hidden')).toBe(true)
    jest.advanceTimersByTime(500)
    expect(downloadFailed.classList.contains('hidden')).toBe(false)
    expect(button.classList.contains('loading')).toBe(false)
  })

  it('should ignore submissions while a download is already in progress', async () => {
    window.fetch = jest.fn().mockResolvedValue({
      status: 200,
      blob: jest.fn().mockResolvedValue(new window.Blob(['pdf-content']))
    })
    loadModule()
    button.classList.add('loading')

    const submitEvent = new window.Event('submit', { cancelable: true })
    form.dispatchEvent(submitEvent)

    expect(submitEvent.defaultPrevented).toBe(true)
    expect(window.fetch).not.toHaveBeenCalled()
  })
})
