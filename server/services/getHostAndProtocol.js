const { config } = require('../../config')
const validProtocols = { http: 'http', https: 'https' }

const { allowedOrigins } = config
const first = (value) => value?.split(',')[0].trim()

const getHostAndProtocol = (request) => {
  const host = first(request.headers['x-forwarded-host']) || request.info.host
  const proto = first(request.headers['x-forwarded-proto']) || request.server.info.protocol
  const protocol = Object.hasOwn(validProtocols, proto) ? validProtocols[proto] : 'https'
  const origin = `${protocol}://${host}`
  return Object.hasOwn(allowedOrigins, origin) && allowedOrigins[origin] ? origin : null
}

module.exports = { getHostAndProtocol }
