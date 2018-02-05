const Boom = require('boom')
const Joi = require('joi')
const riskService = require('../services/risk')
const SummaryViewModel = require('../models/summary-view')

module.exports = {
  method: 'GET',
  path: '/summary/{easting}/{northing}',
  options: {
    description: 'Get flood risk summary for a point',
    handler: async (request, h) => {
      try {
        const easting = encodeURIComponent(request.params.easting)
        const northing = encodeURIComponent(request.params.northing)
        // const polygon = request.query.polygon

        if (request.query.polygon) {
          const result = await riskService.getByPoint(easting, northing)
          if (!result.point_in_england) {
            return h.view('not-england')
          } else {
            return h.view('summary', new SummaryViewModel(easting, northing, result))
              .unstate('pdf-download')
          }
        } else {
          const result = await riskService.getByPoint(easting, northing)
          if (!result.point_in_england) {
            return h.view('not-england')
          } else {
            return h.view('summary', new SummaryViewModel(easting, northing, result))
              .unstate('pdf-download')
          }
        }
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    },
    validate: {
      params: {
        easting: Joi.number().max(700000).positive().required(),
        northing: Joi.number().max(1300000).positive().required()
      },
      query: {
        polygon: Joi.array().items(Joi.array().items(
          Joi.number().max(700000).positive().required(),
          Joi.number().max(1300000).positive().required()
        ))
      }
    }
  }
}
// , {
//   method: 'POST',
//   path: '/summary',
//   options: {
//     description: 'Get flood risk summary for a polygon',
//     handler: async (request, h) => {
//       try {
//         const polygon = request.payload
//         const result = await riskService.getByPolygon(polygon)

//         if (!result.point_in_england) {
//           return h.view('not-england')
//         } else {
//           return h.view('summary', new SummaryViewModel(polygon, result))
//             .unstate('pdf-download')
//         }
//       } catch (err) {
//         return Boom.badImplementation(err.message, err)
//       }
//     },
//     validate: {
//     }
//   }
// }]
