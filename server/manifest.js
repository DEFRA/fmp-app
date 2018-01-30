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
          abortEarly: false
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

if (config.errbit.postErrors) {
  delete config.errbit.postErrors
  manifest.register.plugins.push({
    plugin: 'node-hapi-airbrake',
    options: config.errbit
  })
}

module.exports = manifest
