module.exports = {
  method: 'GET',
  path: '/feedback',
  config: {
    description: 'Get the feedback page',
    handler: function (request, reply) {
      var ref = (request.info.referrer && request.info.referrer.indexOf('/feedback') === -1) ? request.info.referrer : request.server.info.protocol + '://' + request.info.host
      reply.view('feedback', {
        ref: encodeURIComponent(ref),
        feedback: false,
        pageTitle: 'Provide feedback about this service - GOV.UK',
        userAgent: encodeURIComponent(request.headers['user-agent'] ? request.headers['user-agent'] : '')
      })
    }
  }
}
