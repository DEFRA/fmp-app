const { config } = require('../../config')
const validProtocols = { http: 'http', https: 'https' }

const { allowedOrigins } = config
const values = (value) => value?.split(',').map(v => v.trim()).filter(Boolean) ?? []
const isAllowedHost = (host) => Object.hasOwn(allowedOrigins, host) && Boolean(allowedOrigins[host])

// Third party proxies may rewrite, append to, or omit the forwarded headers, so every candidate host
// is checked against allowedOrigins and the first allowed one wins. Anything else yields null.
const getHostAndProtocol = (request) => {
  const { headers, info, server } = request
  const candidates = [...values(headers['x-forwarded-host']), info?.host]
  const host = candidates.find(isAllowedHost)
  if (!host) {
    console.error('Unable to resolve host and protocol from request.headers:', headers)
    console.error('Unable to resolve host and protocol from request.info.host:', info.host)
    return null
  }
  // Only a local development origin may be served over http. Proxies commonly drop or alter
  // x-forwarded-proto, which would otherwise produce mixed content urls on https pages.
  if (!/^localhost:\d+$/.test(host)) {
    return `https://${host}`
  }
  const proto = values(headers['x-forwarded-proto'])[0] || server?.info?.protocol
  return `${Object.hasOwn(validProtocols, proto) ? validProtocols[proto] : 'https'}://${host}`
}

module.exports = { getHostAndProtocol }
