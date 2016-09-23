var Boom = require('boom')
var Joi = require('joi')
var riskService = require('../services/risk')
var errors = require('../models/errors.json')
var SummaryViewModel = require('../models/summary-view')

module.exports = {
  method: 'GET',
  path: '/summary/{easting}/{northing}',
  config: {
    description: 'Get flood risk summary',
    handler: function (request, reply) {
      var easting = request.params.easting
      var northing = request.params.northing
      riskService.get(easting, northing, (err, result) => {
        if (err) {
          return reply(Boom.badImplementation(errors.riskSearch.message, err))
        }
        reply.view('summary', new SummaryViewModel(easting, northing, result))
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
