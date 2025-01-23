const hapi = require('@hapi/hapi')
const { config } = require('./../config')
const CatboxMemory = require('@hapi/catbox-memory')

async function createServer () {
  // Create the hapi server
  const server = hapi.server({
    port: config.server.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    },
    cache: [
      {
        name: 'FMFP',
        provider: {
          constructor: CatboxMemory.Engine,
          options: {
            maxByteSize: 10000,
            minCleanupIntervalMsec: 1000,
            cloneBuffersOnGet: false
          }
        }
      }
    ]
  })

  await server.method(require('./services/pso-contact'))
  await server.method(require('./services/pso-contact-by-polygon'))
  await server.method(require('./services/floodDataByPolygon'))
  await server.method(require('./services/use-automated'))

  // Register the plugins
  await server.register(require('@hapi/inert'))
  await server.register(require('@hapi/h2o2'))
  // Authentication module taking out
  // await server.register(require('./plugins/cookie-auth'))
  await server.register(require('./plugins/views'))
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))
  await server.register(require('blipp'))
  await server.register(require('./plugins/full-url'))
  await server.register(require('./plugins/register-cookie'))

  server.ext('onPreResponse', async (request, h) => {
    request.response.header('cache-control', 'no-cache')
    request.response.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    request.response.header('Content-Security-Policy')
    return h.continue
  })

  return server
}

module.exports = createServer
