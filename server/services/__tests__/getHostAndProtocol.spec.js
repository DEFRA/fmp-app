const allowedHost = 'flood-map-for-planning.service.gov.uk'
const otherAllowedHost = 'fmp2-prd-blue.aws.defra.cloud'
const localHost = 'localhost:3000'

jest.mock('../../../config', () => ({
  config: {
    allowedOrigins: {
      'flood-map-for-planning.service.gov.uk': 'flood-map-for-planning.service.gov.uk',
      'fmp2-prd-blue.aws.defra.cloud': 'fmp2-prd-blue.aws.defra.cloud',
      'localhost:3000': 'localhost:3000',
      emptyValue: ''
    }
  }
}))

const { getHostAndProtocol } = require('../getHostAndProtocol')

const makeRequest = ({ headers = {}, host, protocol = 'http' } = {}) => ({
  headers,
  info: { host },
  server: { info: { protocol } }
})

describe('getHostAndProtocol', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('host resolution', () => {
    it('uses request.info.host when there are no forwarded headers', () => {
      expect(getHostAndProtocol(makeRequest({ host: allowedHost }))).toBe(`https://${allowedHost}`)
    })

    it('prefers x-forwarded-host over request.info.host', () => {
      const request = makeRequest({ host: otherAllowedHost, headers: { 'x-forwarded-host': allowedHost } })
      expect(getHostAndProtocol(request)).toBe(`https://${allowedHost}`)
    })

    it('uses the first allowed host in a comma separated x-forwarded-host', () => {
      const request = makeRequest({ headers: { 'x-forwarded-host': `${otherAllowedHost}, ${allowedHost}` } })
      expect(getHostAndProtocol(request)).toBe(`https://${otherAllowedHost}`)
    })

    it('skips unrecognised forwarded hosts', () => {
      const request = makeRequest({ headers: { 'x-forwarded-host': `proxy.internal, ${allowedHost}` } })
      expect(getHostAndProtocol(request)).toBe(`https://${allowedHost}`)
    })

    it('falls back to request.info.host when x-forwarded-host is not allowed', () => {
      const request = makeRequest({ host: allowedHost, headers: { 'x-forwarded-host': 'proxy.internal' } })
      expect(getHostAndProtocol(request)).toBe(`https://${allowedHost}`)
    })

    it.each(['', ' ', ' , '])('ignores an empty x-forwarded-host "%s"', (value) => {
      const request = makeRequest({ host: allowedHost, headers: { 'x-forwarded-host': value } })
      expect(getHostAndProtocol(request)).toBe(`https://${allowedHost}`)
    })

    it('copes with request.info being undefined when a forwarded host is allowed', () => {
      const request = { headers: { 'x-forwarded-host': allowedHost } }
      expect(getHostAndProtocol(request)).toBe(`https://${allowedHost}`)
    })
  })

  describe('rejected hosts', () => {
    it('returns null and logs when no host is allowed', () => {
      const request = makeRequest({ host: 'proxy.internal', headers: { 'x-forwarded-host': 'other.internal' } })
      expect(getHostAndProtocol(request)).toBeNull()
      expect(console.error).toHaveBeenCalledTimes(2)
    })

    it('returns null when there are no hosts at all', () => {
      expect(getHostAndProtocol(makeRequest())).toBeNull()
    })

    it.each(['constructor', '__proto__', 'toString', 'hasOwnProperty'])(
      'does not treat the Object property "%s" as an allowed host', (host) => {
        expect(getHostAndProtocol(makeRequest({ host }))).toBeNull()
        expect(getHostAndProtocol(makeRequest({ headers: { 'x-forwarded-host': host } }))).toBeNull()
      })

    it('rejects an allowed key with a falsy value', () => {
      expect(getHostAndProtocol(makeRequest({ host: 'emptyValue' }))).toBeNull()
    })

    it('rejects a host with a different port or a suffix of an allowed host', () => {
      expect(getHostAndProtocol(makeRequest({ host: 'localhost:3001' }))).toBeNull()
      expect(getHostAndProtocol(makeRequest({ host: `evil.${allowedHost}` }))).toBeNull()
      expect(getHostAndProtocol(makeRequest({ host: `${allowedHost}:8080` }))).toBeNull()
    })
  })

  describe('protocol', () => {
    it.each(['http', 'https', undefined, 'javascript'])(
      'always uses https for a non-localhost origin (x-forwarded-proto: %s)', (proto) => {
        const headers = proto ? { 'x-forwarded-proto': proto } : {}
        const request = makeRequest({ host: allowedHost, headers, protocol: 'http' })
        expect(getHostAndProtocol(request)).toBe(`https://${allowedHost}`)
      })

    it('uses the forwarded protocol for a localhost origin', () => {
      const request = makeRequest({ host: localHost, headers: { 'x-forwarded-proto': 'https' }, protocol: 'http' })
      expect(getHostAndProtocol(request)).toBe(`https://${localHost}`)
    })

    it('uses the first value of a comma separated x-forwarded-proto for a localhost origin', () => {
      const request = makeRequest({ host: localHost, headers: { 'x-forwarded-proto': 'http, https' }, protocol: 'https' })
      expect(getHostAndProtocol(request)).toBe(`http://${localHost}`)
    })

    it.each(['http', 'https'])('uses the server protocol (%s) for localhost without x-forwarded-proto', (protocol) => {
      expect(getHostAndProtocol(makeRequest({ host: localHost, protocol }))).toBe(`${protocol}://${localHost}`)
    })

    it('falls back to https for localhost with an invalid protocol', () => {
      const request = makeRequest({ host: localHost, headers: { 'x-forwarded-proto': 'ftp' } })
      expect(getHostAndProtocol(request)).toBe(`https://${localHost}`)
    })

    it('falls back to https for localhost when no protocol is available', () => {
      const request = { headers: {}, info: { host: localHost } }
      expect(getHostAndProtocol(request)).toBe(`https://${localHost}`)
    })
  })
})
