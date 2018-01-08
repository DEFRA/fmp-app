'use strict'
const Boom = require('boom')
const Joi = require('joi')
const isEnglandService = require('../services/is-england')
const ConfirmLocationViewModel = require('../models/confirm-location-view')

module.exports = {
  method: 'GET',
  path: '/confirm-location',
  config: {
    description: 'Get confirm location page search results',
    handler: async (request, h) => {
      try {
        const point = request.query
        const result = await isEnglandService.get(point.easting, point.northing)

        if (!result) {
          throw new Error('No Result from England service')
        }

        if (!result.is_england) {
          return h.view('not-england')
        }

        return h.view('confirm-location', new ConfirmLocationViewModel(point.easting, point.northing))
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    },
    validate: {
      query: {
        easting: Joi.number().required(),
        northing: Joi.number().required()
      }
    }
  }
}
