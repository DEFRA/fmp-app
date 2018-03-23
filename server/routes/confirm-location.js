const Boom = require('boom')
const Joi = require('joi')
const QueryString = require('querystring')
const isEnglandService = require('../services/is-england')
const ConfirmLocationViewModel = require('../models/confirm-location-view')

module.exports = {
  method: 'GET',
  path: '/confirm-location',
  options: {
    description: 'Get confirm location page search results',
    handler: async (request, h) => {
      try {
        let point = request.query
        const result = await isEnglandService.get(point.easting, point.northing)

        if (!result) {
          throw new Error('No Result from England service')
        }

        if (!result.is_england) {
          // redirect to the not England page with the search params in the query
          const queryString = QueryString.stringify(request.query)
          return h.redirect('/not-england?' + queryString)
        }

        const model = new ConfirmLocationViewModel(point.easting, point.northing, request.query.polygon)

        return h.view('confirm-location', model)
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    },
    validate: {
      query: {
        easting: Joi.number().max(700000).positive().required(),
        northing: Joi.number().max(1300000).positive().required(),
        polygon: Joi.array().items(Joi.array().items(
          Joi.number().max(700000).positive().required(),
          Joi.number().max(1300000).positive().required()
        )),
        placeOrPostcode: Joi.string(),
        nationalGridReference: Joi.string()
      }
    }
  }
}
