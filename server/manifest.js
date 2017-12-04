const config = require('../config')

const manifest = {
  server: {
    connections: {
      routes: {
        security: true,
        validate: {
          options: {
            abortEarly: false
          }
        }
      }
    }
  },
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
    }
  ]
}

if (config.errbit.postErrors) {
  delete config.errbit.postErrors
  manifest.registrations.push({
    plugin: {
      register: 'node-hapi-airbrake',
      options: config.errbit
    }
  })
}

module.exports = manifest
