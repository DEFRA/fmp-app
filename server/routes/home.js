var Joi = require('joi')
var HomeViewModel = require('../models/home-view')
var errors = require('../models/errors.json')

module.exports = {
  method: 'GET',
  path: '/',
  config: {
    handler: function (request, reply) {
      var err = request.query.err && encodeURIComponent(request.query.err)
      return reply.view('home', new HomeViewModel(err))
    },
    validate: {
      query: {
        err: Joi.string().valid(Object.keys(errors))
      }
    }
  }
}
