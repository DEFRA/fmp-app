const Boom = require('boom')
const Joi = require('joi')
const QueryString = require('querystring')
const isEnglandService = require('../services/is-england')
const ConfirmLocationViewModel = require('../models/confirm-location-view')

module.exports = [{
  method: 'GET',
  path: '/confirm-location',
  options: {
    auth: {
      strategy: 'restricted'
    },
    description: 'Get confirm location page search results',
    handler: async (request, h) => {
      // if a request to the old url, which accepted the param place, was made forward to the homepage
      if (request.query.place) {
        const place = encodeURIComponent(request.query.place)
        if (place) {
          return h.redirect(`/?place=${place}`)
        }
      }

      try {
        const point = request.query
        if (!point.easting || !point.northing) {
          return Boom.badRequest('Easting and northing required')
        }
        const result = await isEnglandService.get(point.easting, point.northing)

        if (!result) {
          throw new Error('No Result from England service')
        }

        if (!result.is_england) {
          // redirect to the not England page with the search params in the query
          const queryString = QueryString.stringify(request.query)
          return h.redirect('/not-england?' + queryString)
        }

        let location = ''
        if (request.query.placeOrPostcode || request.query.nationalGridReference) {
          location = request.query.placeOrPostcode ? request.query.placeOrPostcode : request.query.nationalGridReference
        }

        const model = new ConfirmLocationViewModel(point.easting, point.northing, request.query.polygon, location, point.placeOrPostcode)

        return h.view('confirm-location', model)
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    },
    validate: {
      query: {
        easting: Joi.number().max(700000).positive(),
        northing: Joi.number().max(1300000).positive(),
        polygon: Joi.array().items(Joi.array().items(
          Joi.number().max(700000).positive().required(),
          Joi.number().max(1300000).positive().required()
        )),
        place: Joi.string(),
        placeOrPostcode: Joi.string(),
        nationalGridReference: Joi.string()
      }
    }
  }
}]
