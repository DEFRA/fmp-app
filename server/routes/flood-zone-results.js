const Boom = require('@hapi/boom')
const Joi = require('joi')
const riskService = require('../services/risk')
const util = require('../util')
const FloodRiskView = require('../models/flood-risk-view')
const isEnglandService = require('../services/is-england')
const { polygonStringToArray, getAreaInHectares } = require('../services/shape-utils')

module.exports = [
  {
    method: 'GET',
    path: '/flood-zone-results',
    options: {
      description: 'Displays flood zone results page',
      handler: async (request, h) => {
        try {
          let easting, northing
          let psoEmailAddress = ''
          let areaName = ''
          let useAutomatedService = true
          const fullName = request.query.fullName
          const recipientemail = request.query.recipientemail

          const location = request.query.location
          const placeOrPostcode = request.query.placeOrPostcode
          const polygonString = request.query.polygon
          const polygon = polygonStringToArray(polygonString)
          const center = request.query.center ? JSON.parse(request.query.center) : undefined
          if (polygon) {
            easting = encodeURIComponent(center[0])
            northing = encodeURIComponent(center[1])
          } else {
            easting = encodeURIComponent(request.query.easting)
            northing = encodeURIComponent(request.query.northing)
          }
          const result = await isEnglandService.get(easting, northing)
          if (!result) {
            throw new Error('No Result from England service')
          }
          if (!polygon) {
            const queryString = `easting=${easting}&northing=${northing}&placeOrPostcode=${location}&recipientemail=${recipientemail}&polygonMissing=true`
            return h.redirect('/confirm-location?' + queryString)
          }

          if (!result.is_england) {
            // redirect to the not England page with the search params in the query
            const queryString = new URLSearchParams(request.query).toString()
            return h.redirect('/england-only?' + queryString)
          }

          const psoResults = await request.server.methods.getPsoContacts(easting, northing)
          if (psoResults && psoResults.EmailAddress) {
            psoEmailAddress = psoResults.EmailAddress
          }
          if (psoResults && psoResults.AreaName) {
            areaName = psoResults.AreaName
          }
          if (psoResults && psoResults.useAutomatedService !== undefined && !request.server.methods.ignoreUseAutomatedService()) {
            useAutomatedService = psoResults.useAutomatedService
          }

          // if (polygon) {
          const geoJson = util.convertToGeoJson(polygon)

          const risk = await riskService.getByPolygon(geoJson)

          if (!risk.in_england) {
            return h.redirect(`/england-only?centroid=true&easting=${center[0]}&northing=${center[1]}`)
          } else {
            const plotSize = getAreaInHectares(polygonString)
            const floodZoneResultsData = new FloodRiskView.Model({
              psoEmailAddress,
              areaName,
              risk,
              center,
              polygon,
              location,
              placeOrPostcode,
              recipientemail,
              fullName,
              useAutomatedService,
              plotSize
            })
            return h.view('flood-zone-results', floodZoneResultsData)
              .unstate('pdf-download')
          // }
          // TODO remove old point CODE like this else block
          // } else {
          //   const riskResult = await riskService.getByPoint(easting, northing)
          //   if (!riskResult.point_in_england) {
          //     return h.redirect(`/england-only?easting=${easting}&northing=${northing}`)
          //   } else {
          //     return h.view('flood-zone-results', new FloodRiskView.Model({ psoEmailAddress, areaName, riskResult, [easting, northing], undefined, location, variables }))
          //       .unstate('pdf-download')
          //   }
          }
        } catch (err) {
          return Boom.badImplementation(err.message, err)
        }
      },
      validate: {
        query: Joi.alternatives().required().try(Joi.object().keys({
          easting: Joi.number().max(700000).positive().required(),
          northing: Joi.number().max(1300000).positive().required(),
          location: Joi.string().required(),
          fullName: Joi.string(),
          recipientemail: Joi.string().allow('')
        }), Joi.object().keys({
          polygon: Joi.string().required(),
          center: Joi.string().required(),
          location: Joi.string().required(),
          fullName: Joi.string(),
          recipientemail: Joi.string().allow('')
        }))
      }
    }
  }]
