const Boom = require('@hapi/boom')
const Joi = require('joi')
const riskService = require('../services/risk')
const util = require('../util')
const FloodRiskView = require('../models/flood-risk-view')
const {
  polygonToArray,
  getAreaInHectares,
  getArea,
  buffPolygon
} = require('../services/shape-utils')
const { punctuateAreaName } = require('../services/punctuateAreaName')

const missingPolygonRedirect = (request, h, easting, northing, location) => {
  try {
    const referer = request.headers ? request.headers.referer : undefined
    if (referer) {
      const url = new URL(referer)
      if (url.pathname === '/confirm-location') {
        url.searchParams.append('polygonMissing', true)
        return h.redirect(`${url.pathname}${url.search}`)
      }
    }
  } catch (e) {
    // unused catch is deliberate to ensure that any issues with inferring the redirect
    // from the referer will revert to the old way of redirecting (below)
  }
  const queryString = `easting=${easting}&northing=${northing}&placeOrPostcode=${location}&polygonMissing=true`
  return h.redirect('/confirm-location?' + queryString)
}

const zeroAreaPolygonRedirect = (h, polygon, center, location) => {
  polygon = JSON.stringify(buffPolygon(polygon))
  center = JSON.stringify(center)
  const queryString = `/flood-zone-results?polygon=${polygon}&center=${center}&location=${location}`
  return h.redirect(queryString)
}

module.exports = [
  {
    method: 'GET',
    path: '/flood-zone-results',
    options: {
      description: 'Displays flood zone results page',
      handler: async (request, h) => {
        try {
          let useAutomatedService = true
          const location = request.query.location
          const placeOrPostcode = request.query.placeOrPostcode
          const polygon = polygonToArray(request.query.polygon)
          const center = request.query.center
            ? JSON.parse(request.query.center)
            : undefined
          if (!polygon) {
            return missingPolygonRedirect(
              request,
              h,
              encodeURIComponent(request.query.easting),
              encodeURIComponent(request.query.northing),
              location
            )
          }
          const plotSizeMeters = getArea(polygon)
          if (plotSizeMeters === 0) {
            return zeroAreaPolygonRedirect(h, polygon, center, location)
          }

          const psoResults =
            await request.server.methods.getPsoContactsByPolygon(polygon)

          if (
            !psoResults.EmailAddress ||
            !psoResults.AreaName ||
            !psoResults.LocalAuthorities
          ) {
            const queryString = new URLSearchParams(request.query).toString()
            return h.redirect('/england-only?' + queryString)
          }
          if (
            psoResults &&
            psoResults.useAutomatedService !== undefined &&
            !request.server.methods.ignoreUseAutomatedService()
          ) {
            useAutomatedService = psoResults.useAutomatedService
          }
          const surfaceWaterResults =
            await request.server.methods.getFloodZonesByPolygon(polygon)

          const geoJson = util.convertToGeoJson(polygon)

          const risk = await riskService.getByPolygon(geoJson)
          if (!risk.in_england && !risk.point_in_england) {
            const queryString = new URLSearchParams(request.query).toString()
            return h.redirect('/england-only?' + queryString)
          } else {
            const plotSize = getAreaInHectares(polygon)
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
              localAuthorities: psoResults.LocalAuthorities || '',
              surfaceWaterResults
            })
            return h
              .view('flood-zone-results', floodZoneResultsData)
              .unstate('pdf-download')
          }
        } catch (err) {
          return Boom.badImplementation(err.message, err)
        }
      },
      validate: {
        query: Joi.alternatives()
          .required()
          .try(
            Joi.object().keys({
              easting: Joi.number().max(700000).positive().required(),
              northing: Joi.number().max(1300000).positive().required(),
              location: Joi.string().required(),
              fullName: Joi.string(),
              recipientemail: Joi.string()
            }),
            Joi.object().keys({
              polygon: Joi.string().required(),
              center: Joi.string().required(),
              location: Joi.string().required(),
              fullName: Joi.string(),
              recipientemail: Joi.string()
            })
          )
      }
    }
  }
]
