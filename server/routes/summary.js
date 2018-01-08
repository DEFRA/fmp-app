'use strict'
const Boom = require('boom')
const Joi = require('joi')
const riskService = require('../services/risk')
const SummaryViewModel = require('../models/summary-view')

module.exports = {
  method: 'GET',
  path: '/summary/{easting}/{northing}',
  config: {
    description: 'Get flood risk summary',
    handler: async (request, h) => {
      try {
        const easting = encodeURIComponent(request.params.easting)
        const northing = encodeURIComponent(request.params.northing)
        const result = await riskService.get(easting, northing)
        if (!result.point_in_england) {
          return h.view('not-england')
        } else {
          return h.view('summary', new SummaryViewModel(easting, northing, result))
            .unstate('pdf-download')
        }
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    },
    validate: {
      params: {
        easting: Joi.number().max(700000).positive().required(),
        northing: Joi.number().max(1300000).positive().required()
      }
    }
  }
}
