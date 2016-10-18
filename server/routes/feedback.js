module.exports = {
  method: 'GET',
  path: '/feedback',
  config: {
    description: 'Get the feedback page',
    handler: function (request, reply) {
      var ref

      if (request.info.referrer && request.info.referrer.indexOf('/feedback') === -1) {
        ref = request.info.referrer
      } else {
        ref = request.server.info.protocol + '://' + request.info.host
      }

      reply.view('feedback', {
        ref: encodeURIComponent(ref),
        feedback: false
      })
    }
  }
}
