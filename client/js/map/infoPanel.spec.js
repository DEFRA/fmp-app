const { getInfoPanel } = require('./infoPanel.js')

const buildResponse = (html, ok = true) => ({
  ok,
  text: jest.fn().mockResolvedValue(html)
})

describe('getInfoPanel', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  it('should return null when no infoPanelValues are given', async () => {
    const result = await getInfoPanel(null)

    expect(result).toBeNull()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('should build the request url from the given values and extract the title as the label', async () => {
    globalThis.fetch.mockResolvedValue(buildResponse('some TITLE:Flood zone 2 markup'))

    const result = await getInfoPanel({
      ds: 'floodZones',
      tf: 'presentDay',
      fz: '2',
      fs: 'Fluvial',
      aep: '1',
      version: '3',
      coords: '100,200',
      depth: '150mm'
    })

    const [url, options] = globalThis.fetch.mock.calls[0]
    expect(url).toContain('/defra-map/info-panel?')
    expect(url).toContain('ds=floodZones')
    expect(url).toContain('tf=presentDay')
    expect(url).toContain('fz=2')
    expect(url).toContain('fs=River')
    expect(url).toContain('aep=1')
    expect(url).toContain('v=3')
    expect(options).toEqual({ method: 'GET', cache: 'force-cache' })

    expect(result).toEqual({
      width: '360px',
      label: 'Flood zone 2 markup',
      html: 'some TITLE:Flood zone 2 markup'
    })
  })

  it('should replace COORDS and DEPTH placeholders in the returned markup', async () => {
    globalThis.fetch.mockResolvedValue(buildResponse('coords: COORDS depth: DEPTH'))

    const result = await getInfoPanel({ ds: 'floodZones', tf: 'presentDay', coords: '1,2', depth: '50mm' })

    expect(result.html).toBe('coords: 1,2 depth: 50mm')
  })

  it('should default the depth placeholder to an empty string when not provided', async () => {
    globalThis.fetch.mockResolvedValue(buildResponse('depth: DEPTH'))

    const result = await getInfoPanel({ ds: 'floodZones', tf: 'presentDay', coords: '1,2' })

    expect(result.html).toBe('depth: ')
  })

  it('should return an object with null html and log when the response is not ok', async () => {
    globalThis.fetch.mockResolvedValue(buildResponse('', false))

    const result = await getInfoPanel({ ds: 'floodZones', tf: 'presentDay', coords: '1,2' })

    expect(result).toEqual({ width: '360px', label: undefined, html: null })
  })

  it('should return an object with null html when fetch rejects', async () => {
    globalThis.fetch.mockRejectedValue(new Error('network error'))

    const result = await getInfoPanel({ ds: 'floodZones', tf: 'presentDay', coords: '1,2' })

    expect(result).toEqual({ width: '360px', label: undefined, html: null })
  })

  it.each([
    [undefined, ''],
    ['Coastal', 'Sea'],
    ['Fluvial', 'River'],
    ['pluvial', 'Pluvial']
  ])('should format flood source %p as %p', async (floodSource, expectedFs) => {
    globalThis.fetch.mockResolvedValue(buildResponse('TITLE:x'))

    await getInfoPanel({ ds: 'floodZones', tf: 'presentDay', coords: '1,2', fs: floodSource })

    const [url] = globalThis.fetch.mock.calls[0]
    if (expectedFs) {
      expect(url).toContain(`fs=${expectedFs}`)
    } else {
      expect(url).not.toContain('fs=')
    }
  })
})
