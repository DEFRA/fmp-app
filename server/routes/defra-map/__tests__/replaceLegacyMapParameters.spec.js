const { replaceLegacyMapParameters, rewriteRequired } = require('../replaceLegacyMapParameters')

describe('replaceLegacyMapParameters', () => {
  let searchParams

  afterEach(() => {
    // Ensure that after each test, the searchParams no longer require rewriting
    // otherwise the /map route would redirect endlessly
    expect(rewriteRequired(searchParams)).toBe(false)
  })

  it('should set map:zoom and map:center from cz when not already set', () => {
    searchParams = new URLSearchParams('cz=123,456,7')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('cz')).toBeNull()
    expect(searchParams.get('map:zoom')).toEqual('7')
    expect(searchParams.get('map:center')).toEqual('123,456')
  })

  it('should not overwrite existing map:zoom and map:center when cz is present', () => {
    searchParams = new URLSearchParams('cz=123,456,7&map:zoom=1&map:center=9,9')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('map:zoom')).toEqual('1')
    expect(searchParams.get('map:center')).toEqual('9,9')
  })

  it('should leave map:zoom and map:center unset when cz is absent', () => {
    searchParams = new URLSearchParams('')
    expect(rewriteRequired(searchParams)).toBe(false)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('map:zoom')).toBeNull()
    expect(searchParams.get('map:center')).toBeNull()
  })

  it('should do nothing when seg is absent', () => {
    searchParams = new URLSearchParams('foo=bar')
    expect(rewriteRequired(searchParams)).toBe(false)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('dataset')).toBeNull()
    expect(searchParams.get('timeframe')).toBeNull()
    expect(searchParams.get('depth')).toBeNull()
    expect(searchParams.get('aep')).toBeNull()
    expect(searchParams.get('foo')).toEqual('bar')
  })

  it('should remove seg and set dataset to surfacewater for sw segment', () => {
    searchParams = new URLSearchParams('seg=sw')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('dataset')).toEqual('surfacewater')
    expect(searchParams.get('seg')).toBeNull()
  })

  it('should set dataset to floodzones for fz segment', () => {
    searchParams = new URLSearchParams('seg=fz')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('dataset')).toEqual('floodzones')
    expect(searchParams.get('seg')).toBeNull()
  })

  it('should not overwrite dataset when already set', () => {
    searchParams = new URLSearchParams('seg=sw&dataset=floodzones')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('dataset')).toEqual('floodzones')
    expect(searchParams.get('seg')).toBeNull()
  })

  it('should set timeframe to presentday for pd segment', () => {
    searchParams = new URLSearchParams('seg=pd')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('timeframe')).toEqual('presentday')
    expect(searchParams.get('seg')).toBeNull()
  })

  it('should set timeframe to presentday for fzpd segment', () => {
    searchParams = new URLSearchParams('seg=fzpd')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('timeframe')).toEqual('presentday')
    expect(searchParams.get('seg')).toBeNull()
  })

  it('should set timeframe to climatechange for cl segment', () => {
    searchParams = new URLSearchParams('seg=cl')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('timeframe')).toEqual('climatechange')
    expect(searchParams.get('seg')).toBeNull()
  })

  it('should set timeframe to climatechange for fzcl segment', () => {
    searchParams = new URLSearchParams('seg=fzcl')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('timeframe')).toEqual('climatechange')
    expect(searchParams.get('seg')).toBeNull()
  })

  it('should not overwrite timeframe when already set', () => {
    searchParams = new URLSearchParams('seg=pd&timeframe=climatechange')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('timeframe')).toEqual('climatechange')
    expect(searchParams.get('seg')).toBeNull()
  })

  it.each([
    ['depthAll', 'depthAll'],
    ['depth150', 'extentsFull'],
    ['depth300', 'extentsOver150'],
    ['depth600', 'extentsOver300'],
    ['depth900', 'extentsOver600'],
    ['depth1200', 'extentsOver900'],
    ['depth2300', 'extentsOver1200'],
    ['depthOver2300', 'extentsOver2300']
  ])('should map depth segment %s to %s', (segment, expected) => {
    searchParams = new URLSearchParams(`seg=${segment}`)
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('depth')).toEqual(expected)
  })

  it('should use the first matching depth segment when multiple are present', () => {
    searchParams = new URLSearchParams('seg=depth300,depth600')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('depth')).toEqual('extentsOver150')
  })

  it('should not overwrite depth when already set', () => {
    searchParams = new URLSearchParams('seg=depth300&depth=extentsFull')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('depth')).toEqual('extentsFull')
  })

  it.each([
    ['hr', 'high'],
    ['mr', 'medium'],
    ['lr', 'low']
  ])('should map aep segment %s to %s', (segment, expected) => {
    searchParams = new URLSearchParams(`seg=${segment}`)
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('aep')).toEqual(expected)
  })

  it('should not overwrite aep when already set', () => {
    searchParams = new URLSearchParams('seg=hr&aep=low')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('aep')).toEqual('low')
  })

  it('should handle combined seg and cz parameters together', () => {
    searchParams = new URLSearchParams('seg=sw,pd,depth300,hr&cz=100,200,5')
    expect(rewriteRequired(searchParams)).toBe(true)
    replaceLegacyMapParameters(searchParams)
    expect(searchParams.get('seg')).toBeNull()
    expect(searchParams.get('cz')).toBeNull()
    expect(searchParams.get('dataset')).toEqual('surfacewater')
    expect(searchParams.get('timeframe')).toEqual('presentday')
    expect(searchParams.get('depth')).toEqual('extentsOver150')
    expect(searchParams.get('aep')).toEqual('high')
    expect(searchParams.get('map:zoom')).toEqual('5')
    expect(searchParams.get('map:center')).toEqual('100,200')
  })
})
