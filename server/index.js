const hapi = require('@hapi/hapi')
const config = require('./config')

async function createServer () {
  // Create the hapi server
  const server = hapi.server({
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  })

  // Register the plugins
  await server.register(require('@hapi/inert'))
  await server.register(require('@hapi/h2o2'))
  await server.register(require('./plugins/cookie-auth'))
  await server.register(require('./plugins/views'))
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))
  await server.register(require('blipp'))
  await server.register(require('./plugins/logging'))

  if (config.errbit.postErrors) {
    await server.register({
      plugin: require('node-hapi-airbrake'),
      options: config.errbit.options
    })
  }

  return server
}

module.exports = createServer
