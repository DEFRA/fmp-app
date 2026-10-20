const { version, revision } = require('../../version')
const { getHostAndProtocol } = require('../services/getHostAndProtocol')

const handler = async (request) => {
  const origin = getHostAndProtocol(request)

  return JSON.stringify({
    name: 'fmp-app',
    version: version.substring(0, version.lastIndexOf('-')),
    revision,
    origin
  })
}

const options = {
  description: 'Static health-check page for fmp-app',
  handler
}

module.exports = [
  { method: 'GET', path: '/health-check', options },
  { method: 'GET', path: '/healthcheck', options }
]
