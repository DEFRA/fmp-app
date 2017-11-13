const Glue = require('glue')
const config = require('./config')
const manifest = require('./server/manifest')
const pkg = require('./package.json')
const appName = pkg.name
const appVersion = pkg.version
const views = require('./server/views')

Glue.compose(manifest, function (err, server) {
  if (err) {
    throw err
  }

  const onPostHandler = function (request, reply) {
    // Add full url to context of view for opengraph meta property
    if (request.response.variety === 'view') {
      var fullUrl = views.context.siteUrl + (request.path !== '/' ? request.path : '')
      if (request.query) {
        Object.keys(request.query).forEach(function (key, index) {
          fullUrl += (index === 0 ? '?' : '&') + key + '=' + request.query[key]
        })
      }

      if (request.response.source.context) {
        request.response.source.context.fullUrl = encodeURI(fullUrl)
      } else {
        request.response.source.context = {
          fullUrl: encodeURI(fullUrl)
        }
      }
    }
    reply.continue()
  }

  const preResponse = function (request, reply) {
    var response = request.response

    if (response.isBoom) {
      // An error was raised during
      // processing the request
      var statusCode = response.output.statusCode

      // In the event of 404
      // return the `404` view
      if (statusCode === 404) {
        return reply.view('404').code(statusCode)
      }

      request.log('error', {
        statusCode: statusCode,
        data: response.data,
        message: response.message
      })

      // Manually post the handled errors to errbit
      if (server.methods.hasOwnProperty('notify')) {
        if (!(response.data && response.data.isJoi)) {
          // Errbit doesn't separate deep nested objects, hence individual properties
          response.request_headers = request.headers
          response.request_info = request.info
          response.request_path = request.path
          response.request_params = request.params
          response.request_query = request.query
          server.methods.notify(response)
        }
      }

      // The return the `500` view
      return reply.view('500').code(statusCode)
    }
    return reply.continue()
  }

  const isSecure = config.siteUrl.startsWith('https')

  // Cookie used to notify the client
  // browser that the download is complete
  server.state('pdf-download', {
    ttl: 10000,
    isSecure: isSecure,
    path: '/',
    isSameSite: false,
    isHttpOnly: false,
    encoding: 'none',
    clearInvalid: true,
    strictHeader: true
  })

  server.ext('onPostHandler', onPostHandler)

  server.ext('onPreResponse', preResponse)

  // Load all routes
  server.route(require('./server/routes'))

  // Configure views
  server.views(views)

  /*
   * Start the server
   */
  if (!module.parent) {
    server.start(function (err) {
      var details = {
        name: appName,
        version: appVersion,
        info: server.info
      }

      if (err) {
        details.error = err
        details.message = 'Failed to start ' + details.name
        server.log(['error', 'info'], details)
        throw err
      } else {
        if (config.mockAddressService) {
          // Mock Address service
          require('./server/mock/address')
          server.log('info', 'Address service requests are being mocked')
        }
        details.config = config
        details.message = 'Started ' + details.name
        server.log('info', details)
        console.info('Server running at:', server.info)
      }
    })
  }

  module.exports = server
})
