const config = require('../config')

const manifest = {
  server: {},
  connections: [
    {
      port: process.env.PORT || config.server.port,
      host: config.server.home,
      labels: config.server.labels
    }
  ],
  registrations: [
    {
      plugin: {
        register: 'inert'
      }
    },
    {
      plugin: {
        register: 'vision'
      }
    },
    {
      plugin: {
        register: 'good',
        options: config.logging
      }
    },
    {
      plugin: {
        register: 'h2o2'
      }
    },
    {
      plugin: {
        register: 'node-hapi-airbrake',
        options: {
          key: config.envVars.fmp_app_errbit_key,
          env: 'development',
          host: config.envVars.fmp_app_errbit_host
        }
      }
    }
  ]
}

module.exports = manifest
