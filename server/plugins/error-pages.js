/*
 * Add an `onPreResponse` listener to return error pages
 */

module.exports = {
  plugin: {
    name: 'error-pages',
    register: (server, _options) => {
      server.ext('onPreResponse', (request, h) => {
        const { response } = request

        if (response.isBoom) {
          // An error was raised during
          // processing the request
          const statusCode = response.output.statusCode

          // Set cookiesPolicy.confirmed to true to hide the cookie banner on error pages
          const context = {
            cookiesPolicy: { confirmed: true, essential: true, analytics: false }
          }

          // In the event of 404
          // return the `404` view
          if (statusCode === 404) {
            return h.view('404', context).code(statusCode)
          }

          request.log('error', {
            statusCode,
            data: response.data,
            message: response.message,
            stack: response.stack
          })

          // The return the `500` view
          return h.view('500', context).code(statusCode)
        }
        return h.continue
      })
    }
  }
}
