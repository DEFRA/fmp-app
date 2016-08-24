var HomeViewModel = require('../models/home-view')

module.exports = {
  method: 'GET',
  path: '/',
  config: {
    handler: function (request, reply) {
      var err = request.query.err
      return reply.view('home', new HomeViewModel(err))
    }
  }
}
