const Joi = require('joi')
const QueryString = require('querystring')
const ngrToBng = require('../services/ngr-to-bng')
const addressService = require('../services/address')
const HomeViewModel = require('../models/home-view')
const ngrRegEx = /^((([sS]|[nN])[a-hA-Hj-zJ-Z])|(([tT]|[oO])[abfglmqrvwABFGLMQRVW])|([hH][l-zL-Z])|([jJ][lmqrvwLMQRVW]))([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?$/

module.exports = [{
  method: 'GET',
  path: '/',
  options: {
    handler: (request, h) => {
      return h.view('home', new HomeViewModel())
    }
  }
}, {
  method: 'POST',
  path: '/',
  options: {
    handler: async (request, h) => {
      const payload = request.payload
      // attempt to get BNG coordinates for the place or postcode
      let BNG = {}
      if (payload.type === 'placeOrPostcode') {
        try {
          const address = await addressService.findByPlace(payload.placeOrPostcode)
          if (!address || !address.length || !address[0].geometry_x || !address[0].geometry_y) {
            throw new Error('No address found')
          }
          const addr = address[0]
          BNG.easting = addr.geometry_x
          BNG.northing = addr.geometry_y
        } catch (err) {
          // return error view if E/N lookup by place or postcode fails
          request.log(['error', 'address-service', 'find-by-place'], err)
          const data = {
            type: 'placeOrPostcode',
            placeOrPostcode: payload.placeOrPostcode
          }
          const errors = [{
            path: ['placeOrPostcode']
          }]
          return h.view('home', new HomeViewModel(data, errors))
        }
      } else if (payload.type === 'nationalGridReference') {
        BNG = ngrToBng.convert(payload.nationalGridReference)
      } else if (payload.type === 'eastingNorthing') {
        BNG.easting = payload.easting
        BNG.northing = payload.northing
      }
      // redirect to the confirm location page with the BNG in the query
      let queryParams = {}
      queryParams.easting = BNG.easting || ''
      queryParams.northing = BNG.northing || ''
      // if the search wasn't by E/N include the original search in the query params
      if (payload.type === 'nationalGridReference') {
        queryParams.nationalGridReference = payload.nationalGridReference
      } else if (payload.type === 'placeOrPostcode') {
        queryParams.placeOrPostcode = payload.placeOrPostcode
      }
      const query = QueryString.stringify(queryParams)
      return h.redirect(`/confirm-location?${query}`)
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
