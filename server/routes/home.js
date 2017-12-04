var Joi = require('joi')
var ngrToBng = require('../services/ngr-to-bng')
var addressService = require('../services/address')
var HomeViewModel = require('../models/home-view')
var ngrRegEx = /^((([sS]|[nN])[a-hA-Hj-zJ-Z])|(([tT]|[oO])[abfglmqrvwABFGLMQRVW])|([hH][l-zL-Z])|([jJ][lmqrvwLMQRVW]))([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?$/

module.exports = [{
  method: 'GET',
  path: '/',
  config: {
    handler: function (request, reply) {
      var query = request.query
      var data, errors

      if (query.err) {
        data = {
          type: 'placeOrPostcode',
          placeOrPostcode: query.placeOrPostcode
        }

        errors = [{
          path: 'placeOrPostcode'
        }]
      }

      return reply.view('home', new HomeViewModel(data, errors))
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
    handler: function (request, reply) {
      var payload = request.payload
      if (payload.type === 'placeOrPostcode') {
        // Use the address service to lookup submitted place or postcode
        addressService.findByPlace(payload.placeOrPostcode, function (err, address) {
          if (err) {
            request.log(['error', 'address-service', 'find-by-place'], err)
          }

          if (err || !address.length || !address[0].geometry_x || !address[0].geometry_y) {
            var placeOrPostcode = encodeURIComponent(payload.placeOrPostcode)
            return reply.redirect('/?err=invalidPlaceOrPostcode&placeOrPostcode=' + placeOrPostcode)
          }

          // Using the returned address' x/y coordinates, redirect to the confirm location page
          var addr = address[0]
          return reply.redirect(`/confirm-location?easting=${addr.geometry_x}&northing=${addr.geometry_y}`)
        })
      } else if (payload.type === 'nationalGridReference') {
        // Convert the supplied NGR to E/N and redirect to the confirm location page
        var point = ngrToBng.convert(payload.nationalGridReference)

        return reply.redirect(`/confirm-location?easting=${point.easting}&northing=${point.northing}`)
      } else if (payload.type === 'eastingNorthing') {
        // Using the supplied Easting and Northing, redirect to the confirm location page
        return reply.redirect(`/confirm-location?easting=${payload.easting}&northing=${payload.northing}`)
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
          then: Joi.string().trim().required().regex(ngrRegEx),
          otherwise: Joi.strip()
        }),
        easting: Joi.when('type', {
          is: 'eastingNorthing',
          then: Joi.number().required(),
          otherwise: Joi.strip()
        }),
        northing: Joi.when('type', {
          is: 'eastingNorthing',
          then: Joi.number().required(),
          otherwise: Joi.strip()
        })
      },
      failAction: function (request, reply, source, error) {
        var errors = error.data.details
        var payload = request.payload || {}
        reply.view('home', new HomeViewModel(payload, errors))
      }
    }
  }
}]
