const { getQueryParam, setQueryParam } = require('./queryParams.js')

const setUrl = (url) => {
  window.history.replaceState({}, '', url)
}

describe('getQueryParam', () => {
  afterEach(() => {
    setUrl('http://localhost/')
  })

  it('should return the value of an existing query param', () => {
    setUrl('http://localhost/?location=Bristol')

    expect(getQueryParam('location')).toBe('Bristol')
  })

  it('should return the default value when the param is missing', () => {
    setUrl('http://localhost/')

    expect(getQueryParam('location', 'fallback')).toBe('fallback')
  })

  it('should return null by default when the param is missing and no default is given', () => {
    setUrl('http://localhost/')

    expect(getQueryParam('location')).toBeNull()
  })
})

describe('setQueryParam', () => {
  afterEach(() => {
    setUrl('http://localhost/')
  })

  it('should add a query param to the url', () => {
    setUrl('http://localhost/')

    setQueryParam('polygon', '[[0,0]]')

    expect(window.location.search).toContain('polygon=')
    expect(getQueryParam('polygon')).toBe('[[0,0]]')
  })

  it('should update an existing query param', () => {
    setUrl('http://localhost/?polygon=old')

    setQueryParam('polygon', 'new')

    expect(getQueryParam('polygon')).toBe('new')
  })

  it('should remove the query param when the value is null', () => {
    setUrl('http://localhost/?polygon=old')

    setQueryParam('polygon', null)

    expect(window.location.search).not.toContain('polygon')
  })

  it('should remove the query param when the value is undefined', () => {
    setUrl('http://localhost/?polygon=old')

    setQueryParam('polygon', undefined)

    expect(window.location.search).not.toContain('polygon')
  })

  it('should remove the query param when the value is an empty string', () => {
    setUrl('http://localhost/?polygon=old')

    setQueryParam('polygon', '')

    expect(window.location.search).not.toContain('polygon')
  })
})
