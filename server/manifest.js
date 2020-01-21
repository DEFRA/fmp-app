const config = require('../config')
const viewOptions = require('./views')

const manifest = {
  server: {
    port: config.server.port,
    host: config.server.host,
    routes: {
      security: true,
      validate: {
        options: {
          abortEarly: false,
          stripUnknown: true
        }
      }
    }
  },
  register: {
    plugins: [
      {
        plugin: 'inert'
      },
      {
        plugin: 'vision',
        options: viewOptions
      },
      {
        plugin: 'good',
        options: config.logging
      },
      {
        plugin: 'h2o2'
      },
      './plugins/register-cookie',
      './plugins/full-url',
      './plugins/log-errors',
      './plugins/router'
    ]
  }
}
// $lab:coverage:off$
if (config.errbit.postErrors) {
// $lab:coverage:on$
  delete config.errbit.postErrors
  manifest.register.plugins.push({
    plugin: 'node-hapi-airbrake',
    options: config.errbit
  })
}

module.exports = manifest
