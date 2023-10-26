const Boom = require('@hapi/boom')
const Joi = require('joi')
const isEnglandService = require('../services/is-england')
const ConfirmLocationViewModel = require('../models/confirm-location-view')

class NotEnglandError extends Error {}
class BadRequestError extends Error {}

const getAnalyticsPageEvent = query => {
  const TYPE = query.isPostCode
    ? 'POSTCODE'
    : query.placeOrPostcode
      ? 'PLACENAME'
      : query.nationalGridReference
        ? 'NGR'
        : 'EASTINGS'
  return {
    event: 'SEARCH',
    parameters: {
      TYPE,
      ERROR: false
    }
  }
}

const parsePolygon = ({ polygon }) => {
  try {
    return polygon ? JSON.parse(polygon) : undefined
  } catch {
    throw new BadRequestError('Invalid polygon value passed')
  }
}

const getPsoContactDetails = async (request, polygon, easting, northing) => {
  if (!easting || !northing) {
    throw new BadRequestError('Easting and northing required')
  }
  if (polygon) {
    // A polygon is submitted to this page when Redraw the boundary of your site
    // is clicked. In this scenario, it is possible that the centre point is
    // outside of England (typically when near the coast), so we use the polygon
    // response rather than the isEngland response
    const psoResults = await request.server.methods.getPsoContactsByPolygon(polygon)
    if (!psoResults.EmailAddress || !psoResults.AreaName || !psoResults.LocalAuthorities) {
      throw new NotEnglandError()
    }
    return psoResults
  } else {
    const result = await isEnglandService.get(easting, northing)
    if (!result) {
      throw new Error('No Result from England service')
    }
    if (!result.is_england) {
      throw new NotEnglandError()
    }
    return request.server.methods.getPsoContacts(easting, northing)
  }
}

module.exports = [{
  method: 'GET',
  path: '/confirm-location',
  options: {
    description: 'Get confirm location page search results',
    handler: async (request, h) => {
      try {
        const {
          easting,
          northing,
          placeOrPostcode,
          nationalGridReference,
          polygonMissing,
          recipientemail = ' ',
          fullName = ' '
        } = request.query

        const polygon = parsePolygon(request.query)
        const contactDetails = await getPsoContactDetails(request, polygon, easting, northing)

        let location = ''
        if (placeOrPostcode || nationalGridReference) {
          location = placeOrPostcode || nationalGridReference
        } else {
          location = `${easting} ${northing}`
        }

        let { locationDetails = '' } = request.query
        if (locationDetails) {
          locationDetails = locationDetails
            .replace((new RegExp(`^${placeOrPostcode}, `, 'i')), '')
        }
        const model = new ConfirmLocationViewModel(
          {
            easting,
            northing,
            polygon,
            location,
            placeOrPostcode,
            recipientemail,
            fullName,
            locationDetails,
            contactDetails,
            polygonMissing: Boolean(polygonMissing),
            analyticsPageEvent: getAnalyticsPageEvent(request.query)
          })

        return h.view('confirm-location', model)
      } catch (err) {
        if (err instanceof NotEnglandError) {
          const queryString = new URLSearchParams(request.query).toString()
          return h.redirect('/england-only?' + queryString)
        }
        if (err instanceof BadRequestError) {
          return Boom.badRequest(err.message)
        }
        return Boom.badImplementation(err.message, err)
      }
    },
    validate: {
      query: Joi.object().keys({
        easting: Joi.number().max(700000).positive(),
        northing: Joi.number().max(1300000).positive(),
        polygon: Joi.string(),
        place: Joi.string(),
        placeOrPostcode: Joi.string(),
        nationalGridReference: Joi.string(),
        recipientemail: Joi.string(),
        fullName: Joi.string(),
        locationDetails: Joi.string(),
        polygonMissing: Joi.boolean(),
        isPostCode: Joi.boolean()
      })
    }
  }
}]
