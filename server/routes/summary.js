// var Boom = require('boom')
var Joi = require('joi')
// var errors = require('../models/errors.json')
var MapsViewModel = require('../models/maps-view')

module.exports = {
  method: 'GET',
  path: '/summary/{easting}/{northing}',
  config: {
    description: 'Get flood risk summary',
    handler: function (request, reply) {
      var easting = request.params.easting
      var northing = request.params.northing

      reply.view('summary', new MapsViewModel(easting, northing))
    },
    validate: {
      params: {
        easting: Joi.number().required(),
        northing: Joi.number().required()
      }
    }
  }
}
