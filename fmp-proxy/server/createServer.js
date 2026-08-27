const hapi = require('@hapi/hapi')
const { config } = require('./config')
const { logDebug } = require('./services/proxyDebug')
const createServer = async () => {
  const server = hapi.server({
    port: config.port,
    routes: {
      cors: true,
      validate: {
        options: {
          abortEarly: false
        }
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  await server.register(require('@hapi/h2o2'))
  await server.register(require('./plugins/router'))

  server.ext('onPreResponse', (request, h) => {
    const response = request.response
    if (request.path.startsWith('/proxy/')) {
      const statusCode = response?.output?.statusCode || response?.statusCode
      logDebug('proxy response completed', {
        method: request.method,
        path: request.path,
        statusCode
      })
    }

    if (response?.isBoom) {
      logDebug('proxy request failed', {
        method: request.method,
        path: request.path,
        statusCode: response.output?.statusCode,
        message: response.message
      })
    }
    return h.continue
  })

  console.log('proxy server configured on port', config.port)
  return server
}

module.exports = createServer
