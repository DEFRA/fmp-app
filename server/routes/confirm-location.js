var Boom = require('boom')
var Joi = require('joi')
var isEnglandService = require('../services/is-england')
var ConfirmLocationViewModel = require('../models/confirm-location-view')

module.exports = {
  method: 'GET',
  path: '/confirm-location',
  config: {
    description: 'Get confirm location page search results',
    handler: function (request, reply) {
      var point = request.query

      isEnglandService.get(point.easting, point.northing, function (err, result) {
        if (err || !result) {
          return reply(Boom.badImplementation(err.message, err))
        }

        if (!result.is_england) {
          return reply.view('not-england')
        }

        reply.view('confirm-location', new ConfirmLocationViewModel(point.easting, point.northing))
      })
    },
    validate: {
      query: {
        easting: Joi.number().required(),
        northing: Joi.number().required()
      }
    }
  }
}
