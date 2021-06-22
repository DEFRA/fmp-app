const Boom = require('boom')
const Joi = require('joi')
const riskService = require('../services/risk')
const util = require('../util')
const FloodRiskViewModel = require('../models/flood-risk-view')
const psoContactDetails = require('../services/pso-contact')

module.exports = [
  {
    method: 'GET',
    path: '/flood-zone-results',
    options: {
      description: 'Displays flood zone results page',
      auth: {
        strategy: 'restricted'
      },
      handler: async (request, h) => {
        try {
          let easting, northing
          let psoEmailAddress = ''
          let areaName = ''
          const location = request.query.location
          const placeOrPostcode = request.query.placeOrPostcode

          if (request.query.polygon) {
            const center = request.query.center
            easting = encodeURIComponent(center[0])
            northing = encodeURIComponent(center[1])
          } else {
            easting = encodeURIComponent(request.query.easting)
            northing = encodeURIComponent(request.query.northing)
          }

          const psoResults = await psoContactDetails.getPsoContacts(easting, northing)

          if (psoResults && psoResults.EmailAddress) {
            psoEmailAddress = psoResults.EmailAddress
          }
          if (psoResults && psoResults.AreaName) {
            areaName = psoResults.AreaName
          }

          if (request.query.polygon) {
            const center = request.query.center
            const polygon = request.query.polygon
            const geoJson = util.convertToGeoJson(polygon)

            const riskResult = await riskService.getByPolygon(geoJson)

            if (!riskResult.in_england) {
              return h.redirect(`/not-england?centroid=true&easting=${center[0]}&northing=${center[1]}`)
            } else {
              return h.view('flood-zone-results', new FloodRiskViewModel(psoEmailAddress, areaName, riskResult, center, polygon, location, placeOrPostcode, request.query.zoneNumber))
                .unstate('pdf-download')
            }
          } else {
            const riskResult = await riskService.getByPoint(easting, northing)
            if (!riskResult.point_in_england) {
              return h.redirect(`/not-england?easting=${easting}&northing=${northing}`)
            } else {
              return h.view('flood-zone-results', new FloodRiskViewModel(psoEmailAddress, areaName, riskResult, [easting, northing], undefined, location, placeOrPostcode))
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
          northing: Joi.number().max(1300000).positive().required(),
          location: Joi.string().required()
        }, {
          polygon: Joi.array().required().items(Joi.array().items(
            Joi.number().max(700000).positive().required(),
            Joi.number().max(1300000).positive().required()
          )),
          center: Joi.array().required(),
          location: Joi.string().required()
        }])
      }
    }
  }]
