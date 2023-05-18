const Boom = require('@hapi/boom')
const Joi = require('joi')
const riskService = require('../services/risk')
const util = require('../util')
const FloodRiskView = require('../models/flood-risk-view')
const { polygonStringToArray, getAreaInHectares } = require('../services/shape-utils')
const { punctuateAreaName } = require('../services/punctuateAreaName')

module.exports = [
  {
    method: 'GET',
    path: '/flood-zone-results',
    options: {
      description: 'Displays flood zone results page',
      handler: async (request, h) => {
        try {
          let easting, northing
          let useAutomatedService = true
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
          if (!polygon) {
            const queryString = `easting=${easting}&northing=${northing}&placeOrPostcode=${location}&polygonMissing=true`
            return h.redirect('/confirm-location?' + queryString)
          }

          const psoResults = await request.server.methods.getPsoContactsByPolygon(polygon)
          if (!psoResults.EmailAddress || !psoResults.AreaName || !psoResults.LocalAuthorities) {
            const queryString = new URLSearchParams(request.query).toString()
            return h.redirect('/england-only?' + queryString)
          }
          if (psoResults && psoResults.useAutomatedService !== undefined && !request.server.methods.ignoreUseAutomatedService()) {
            useAutomatedService = psoResults.useAutomatedService
          }

          const geoJson = util.convertToGeoJson(polygon)

          const risk = await riskService.getByPolygon(geoJson)

          if (!risk.in_england && !risk.point_in_england) {
            const queryString = new URLSearchParams(request.query).toString()
            return h.redirect('/england-only?' + queryString)
          } else {
            const plotSize = getAreaInHectares(polygonString)
            const floodZoneResultsData = new FloodRiskView.Model({
              psoEmailAddress: psoResults.EmailAddress || undefined,
              areaName: punctuateAreaName(psoResults.AreaName) || undefined,
              risk,
              center,
              polygon,
              location,
              placeOrPostcode,
              useAutomatedService,
              plotSize,
              localAuthorities: psoResults.LocalAuthorities || ''
            })
            return h.view('flood-zone-results', floodZoneResultsData)
              .unstate('pdf-download')
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
          recipientemail: Joi.string()
        }), Joi.object().keys({
          polygon: Joi.string().required(),
          center: Joi.string().required(),
          location: Joi.string().required(),
          fullName: Joi.string(),
          recipientemail: Joi.string()
        }))
      }
    }
  }]
