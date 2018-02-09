const Boom = require('boom')
const Joi = require('joi')
const riskService = require('../services/risk')
const SummaryViewModel = require('../models/summary-view')

module.exports = {
  method: 'GET',
  path: '/summary',
  options: {
    description: 'Get flood risk summary for a point',
    handler: async (request, h) => {
      try {
        if (request.query.polygon) {
          const polygon = request.query.polygon
          const geoJson = '{"type": "Polygon", "coordinates": [' + JSON.stringify(request.query.polygon) + ']}'

          const result = await riskService.getByPolygon(geoJson)

          if (!result.in_england) {
            return h.view('not-england')
          } else {
            return h.view('summary', new SummaryViewModel(result, polygon))
              .unstate('pdf-download')
          }
        } else {
          const easting = encodeURIComponent(request.query.easting)
          const northing = encodeURIComponent(request.query.northing)
          const result = await riskService.getByPoint(easting, northing)

          if (!result.point_in_england) {
            return h.view('not-england')
          } else {
            return h.view('summary', new SummaryViewModel(result, easting, northing))
              .unstate('pdf-download')
          }
        }
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    },
    validate: {
      query: Joi.alternatives().required().try([{
        easting: Joi.number().max(700000).positive().required(),
        northing: Joi.number().max(1300000).positive().required()
      }, {
        polygon: Joi.array().required().items(Joi.array().items(
          Joi.number().max(700000).positive().required(),
          Joi.number().max(1300000).positive().required()
        ))
      }])
    }
  }
}
