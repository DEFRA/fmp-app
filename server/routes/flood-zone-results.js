const Boom = require('@hapi/boom')
const Joi = require('joi')
const riskService = require('../services/risk')
const util = require('../util')
const FloodRiskView = require('../models/flood-risk-view')
const {
  polygonToArray,
  getAreaInHectares,
  getArea,
  buffPolygon,
  getExtents
} = require('../services/shape-utils')
const { punctuateAreaName } = require('../services/punctuateAreaName')
const config = require('../../config')

const missingPolygonRedirect = (request, h, easting, northing, location) => {
  try {
    const referer = request.headers ? request.headers.referer : undefined
    if (referer) {
      const url = new URL(referer)
      if (url.pathname === '/confirm-location') {
        if (url.searchParams.get('polygonTooLarge')) {
          url.searchParams.delete('polygonTooLarge')
        }
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
          if (config.mockAddressService) {
            const { query } = request
            request.query = {
              ...query,
              polygon:
                '[[479657,484223],[479655,484224],[479730,484210],[479657,484223]]',
              center: '[479692,484217]',
              location: 'Pickering'
            }
          }
          let useAutomatedService = true
          const location = request.query.location
          const placeOrPostcode = request.query.placeOrPostcode
          const polygon = polygonToArray(request.query.polygon)
          const center = request.query.center ? JSON.parse(request.query.center) : undefined
          const easting = request.query.easting ? encodeURIComponent(request.query.easting) : center[0]
          const northing = request.query.northing ? encodeURIComponent(request.query.northing) : center[1]

          if (!polygon) {
            return missingPolygonRedirect(request, h, easting, northing, location)
          }
          const plotSizeMeters = getArea(polygon)
          if (plotSizeMeters === 0) {
            return zeroAreaPolygonRedirect(h, polygon, center, location)
          }
          const { width, height } = getExtents(polygon)
          if (width > 1750 || height > 2000) {
            const queryString = `easting=${easting}&northing=${northing}&placeOrPostcode=${location}&polygon=${request.query.polygon}&polygonTooLarge=true`
            return h.redirect('/confirm-location?' + queryString)
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
