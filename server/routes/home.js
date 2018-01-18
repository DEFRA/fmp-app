'use strict'
const Joi = require('joi')
const Boom = require('boom')
const ngrToBng = require('../services/ngr-to-bng')
const addressService = require('../services/address')
const HomeViewModel = require('../models/home-view')
const ngrRegEx = /^((([sS]|[nN])[a-hA-Hj-zJ-Z])|(([tT]|[oO])[abfglmqrvwABFGLMQRVW])|([hH][l-zL-Z])|([jJ][lmqrvwLMQRVW]))([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?$/

module.exports = [{
  method: 'GET',
  path: '/',
  config: {
    handler: (request, h) => {
      try {
        const query = request.query
        let data, errors

        if (query.err) {
          data = {
            type: 'placeOrPostcode',
            placeOrPostcode: query.placeOrPostcode
          }

          errors = [{
            path: ['placeOrPostcode']
          }]
        }

        return h.view('home', new HomeViewModel(data, errors))
      } catch (err) {
        return Boom.badRequest('Failed to load home page')
      }
    },
    validate: {
      query: {
        err: Joi.string().valid('invalidPlaceOrPostcode'),
        placeOrPostcode: Joi.string().when('err', {
          is: 'invalidPlaceOrPostcode',
          then: Joi.required(),
          otherwise: Joi.strip()
        })
      }
    }
  }
}, {
  method: 'POST',
  path: '/',
  config: {
    handler: async (request, h) => {
      const payload = request.payload
      if (payload.type === 'placeOrPostcode') {
        try {
          const address = await addressService.findByPlace(payload.placeOrPostcode)
          if (!address || !address.length || !address[0].geometry_x || !address[0].geometry_y) {
            throw new Error('No address found')
          }
          // Using the returned address' x/y coordinates, redirect to the confirm location page
          const addr = address[0]
          return h.redirect(`/confirm-location?easting=${addr.geometry_x}&northing=${addr.geometry_y}`)
        } catch (err) {
          request.log(['error', 'address-service', 'find-by-place'], err)
          const placeOrPostcode = encodeURIComponent(payload.placeOrPostcode)
          return h.redirect('/?err=invalidPlaceOrPostcode&placeOrPostcode=' + placeOrPostcode)
        }
      } else if (payload.type === 'nationalGridReference') {
        // Convert the supplied NGR to E/N and redirect to the confirm location page
        const point = ngrToBng.convert(payload.nationalGridReference)

        return h.redirect(`/confirm-location?easting=${point.easting}&northing=${point.northing}`)
      } else if (payload.type === 'eastingNorthing') {
        // Using the supplied Easting and Northing, redirect to the confirm location page
        return h.redirect(`/confirm-location?easting=${payload.easting}&northing=${payload.northing}`)
      }
    },
    validate: {
      payload: {
        type: Joi.string().required().valid('placeOrPostcode', 'nationalGridReference', 'eastingNorthing'),
        placeOrPostcode: Joi.when('type', {
          is: 'placeOrPostcode',
          then: Joi.string().trim().required(),
          otherwise: Joi.strip()
        }),
        nationalGridReference: Joi.when('type', {
          is: 'nationalGridReference',
          then: Joi.string().replace(' ', '').required().regex(ngrRegEx),
          otherwise: Joi.strip()
        }),
        easting: Joi.when('type', {
          is: 'eastingNorthing',
          then: Joi.number().max(700000).positive().required(),
          otherwise: Joi.strip()
        }),
        northing: Joi.when('type', {
          is: 'eastingNorthing',
          then: Joi.number().max(1300000).positive().required(),
          otherwise: Joi.strip()
        })
      },
      failAction: (request, h, error) => {
        const errors = error.details
        const payload = request.payload || {}
        const model = new HomeViewModel(payload, errors)
        // https://hapijs.com/api#takeover-response
        // https://github.com/hapijs/hapi/issues/3658 (Lifecycle methods)
        return h.view('home', model).takeover()
      }
    }
  }
}]
