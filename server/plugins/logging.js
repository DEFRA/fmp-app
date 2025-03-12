const HapiPino = require('hapi-pino')
const { config } = require('../../config')

module.exports = {
  plugin: HapiPino,
  options: {
    logPayload: true,
    level: config.logLevel,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers'],
      remove: true
    },
    ignoreTags: [
      'asset'
    ]
  }
}
