var Joi = require('joi')
var HomeViewModel = require('../models/home-view')
var errors = require('../models/errors.json')

module.exports = {
  method: 'GET',
  path: '/',
  config: {
    handler: function (request, reply) {
      var err = request.query.err && encodeURIComponent(request.query.err)
      var place = request.query.place
      return reply.view('home', new HomeViewModel(err, place))
    },
    validate: {
      query: {
        err: Joi.string().valid(Object.keys(errors)),
        place: Joi.string().allow('')
      }
    }
  }
}
