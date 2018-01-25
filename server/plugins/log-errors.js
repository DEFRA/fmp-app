exports.plugin = {
  name: 'log-errors',
  register: (server, options) => {
    server.ext('onPreResponse', (request, h) => {
      const response = request.response

      if (response.isBoom) {
        // An error was raised during
        // processing the request
        const statusCode = response.output.statusCode

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
        // if (server.methods.hasOwnProperty('notify')) {
        //   if (!(response.data && response.data.isJoi)) {
        //     // Errbit doesn't separate deep nested objects, hence individual properties
        //     response.request_headers = request.headers
        //     response.request_info = request.info
        //     response.request_path = request.path
        //     response.request_params = request.params
        //     response.request_query = request.query
        //     server.methods.notify(response)
        //   }
        // }

        // The return the `500` view
        return h.view('500').code(statusCode)
      }

      return h.continue
    })
  }
}
