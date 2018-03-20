const Boom = require('boom')
const Joi = require('joi')
const riskService = require('../services/risk')
const SummaryViewModel = require('../models/summary-view')
const util = require('../util')

module.exports = {
  method: 'GET',
  path: '/summary',
  options: {
    description: 'Get flood risk summary for a point',
    handler: async (request, h) => {
      try {
        if (request.query.polygon) {
          const center = request.query.center
          const polygon = request.query.polygon
          const geoJson = util.convertToGeoJson(polygon)

          const result = await riskService.getByPolygon(geoJson)

          if (!result.in_england) {
            return h.redirect(`not-england?centroid=true&easting=${center[0]}&northing=${center[1]}`)
          } else {
            return h.view('summary', new SummaryViewModel(result, center, polygon))
              .unstate('pdf-download')
          }
        } else {
          const easting = encodeURIComponent(request.query.easting)
          const northing = encodeURIComponent(request.query.northing)
          const result = await riskService.getByPoint(easting, northing)

          if (!result.point_in_england) {
            return h.redirect(`not-england?easting=${easting}&northing=${northing}`)
          } else {
            return h.view('summary', new SummaryViewModel(result, [easting, northing]))
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
        )),
        center: Joi.array().required()
      }])
    }
  }
}
