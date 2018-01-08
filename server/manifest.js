const config = require('../config')

const manifest = {
  server: {
    port: process.env.PORT || config.server.port,
    host: config.server.home,
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
        plugin: 'vision'
      },
      {
        plugin: require('good'),
        options: config.logging
      },
      {
        plugin: 'h2o2'
      }
    ]
  }
}

if (config.errbit.postErrors) {
  delete config.errbit.postErrors
  manifest.register.plugins.push({
    plugin: require('node-hapi-airbrake'),
    options: config.errbit
  })
}

module.exports = manifest
