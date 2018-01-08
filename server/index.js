'use strict'
const Glue = require('glue')
const config = require('../config')
const manifest = require('./manifest')
const views = require('./views')

module.exports = async () => {
  const server = await Glue.compose(manifest)

  // Cookie used to notify the client
  // browser that the download is complete
  server.state('pdf-download', {
    ttl: 10000,
    isSecure: config.siteUrl.startsWith('https'),
    path: '/',
    isSameSite: false,
    isHttpOnly: false,
    encoding: 'none',
    clearInvalid: true,
    strictHeader: true
  })

  server.ext({
    type: 'onPostHandler',
    method: (request, h) => {
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
      return h.continue
    }
  })

  server.ext({
    type: 'onPreResponse',
    method: (request, h) => {
      var response = request.response

      if (response.isBoom) {
        // An error was raised during
        // processing the request
        var statusCode = response.output.statusCode

        // In the event of 404
        // return the `404` view
        if (statusCode === 404) {
          return h.view('404').code(statusCode)
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
        return h.view('500').code(statusCode)
      }
      return h.continue
    }
  })

  // Load all routes
  server.route(require('./routes'))

  // Configure views
  server.views(views)

  return server
}
