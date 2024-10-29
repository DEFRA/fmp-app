const { version, revision } = require('../../version')

const handler = async () => {
  return JSON.stringify({
    name: 'fmp-app',
    version: version.substring(0, version.lastIndexOf('-')),
    revision
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
