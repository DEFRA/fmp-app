const Boom = require('@hapi/boom')
const Joi = require('joi')
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

          const contactDetails = await request.server.methods.getPsoContactsByPolygon(polygon)

          if (!contactDetails.isEngland) {
            const queryString = new URLSearchParams(request.query).toString()
            return h.redirect('/england-only?' + queryString)
          }
          if (!request.server.methods.ignoreUseAutomatedService()) {
            useAutomatedService = contactDetails.useAutomatedService
          }
          const floodZoneResults = await request.server.methods.getFloodDataByPolygon(polygon)

          const plotSize = getAreaInHectares(polygon)
          const floodZoneResultsData = new FloodRiskView.Model({
            psoEmailAddress: contactDetails.EmailAddress || undefined,
            areaName: punctuateAreaName(contactDetails.AreaName) || undefined,
            center,
            polygon,
            location,
            placeOrPostcode,
            useAutomatedService,
            plotSize,
            localAuthorities: contactDetails.LocalAuthorities || '',
            floodZoneResults
          })
          return h
            .view('flood-zone-results', floodZoneResultsData)
        } catch (err) {
          console.log('Error in flood zone results', err.message)
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
