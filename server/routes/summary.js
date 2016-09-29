var Boom = require('boom')
var Joi = require('joi')
var riskService = require('../services/risk')
var SummaryViewModel = require('../models/summary-view')

module.exports = {
  method: 'GET',
  path: '/summary/{easting}/{northing}',
  config: {
    description: 'Get flood risk summary',
    handler: function (request, reply) {
      var easting = encodeURIComponent(request.params.easting)
      var northing = encodeURIComponent(request.params.northing)
      riskService.get(easting, northing, (err, result) => {
        if (err) {
          return reply(Boom.badImplementation(err.message, err))
        }
        if (!result.point_in_england) {
          reply.view('not-england')
        } else {
          reply.view('summary', new SummaryViewModel(easting, northing, result))
        }
      })
    },
    validate: {
      params: {
        easting: Joi.number().max(700000).positive().required(),
        northing: Joi.number().max(1300000).positive().required()
      }
    }
  }
}
