var Boom = require('boom')
var Joi = require('joi')
var addressService = require('../services/address')
var isEnglandService = require('../services/is-england')
var ngrToBngService = require('../services/ngr-to-bng')
var ConfirmLocationViewModel = require('../models/confirm-location-view')
var ngrRegEx = /^((([sS]|[nN])[a-hA-Hj-zJ-Z])|(([tT]|[oO])[abfglmqrvwABFGLMQRVW])|([hH][l-zL-Z])|([jJ][lmqrvwLMQRVW]))([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?$/

module.exports = {
  method: 'GET',
  path: '/confirm-location',
  config: {
    description: 'Get place search results',
    handler: function (request, reply) {
      var term = request.query.place && encodeURIComponent(request.query.place)

      if (!term) {
        return reply.redirect('/?err=noPlace')
      }

      var point = {}

      // if NGR then convert to BNG point
      if (ngrRegEx.test(term)) {
        point = ngrToBngService.convert(term)
      }

      if (!point || !point.easting || !point.northing) {
        addressService.findByPlace(term, function (err, address) {
          if (err) {
            request.log(['error', 'address-service', 'find-by-place'], err)
          }

          if (err || !address.length || !address[0].geometry_x || !address[0].geometry_y) {
            return reply.redirect('/?err=invalidPlace&place=' + term)
          }

          point.easting = address[0].geometry_x
          point.northing = address[0].geometry_y
          usePoint()
        })
      } else {
        usePoint()
      }

      function usePoint () {
        isEnglandService.get(point.easting, point.northing, function (err, result) {
          if (err || !result) {
            return reply(Boom.badImplementation(err.message, err))
          }
          if (result.is_england) {
            reply.view('confirm-location', new ConfirmLocationViewModel(point.easting, point.northing))
          } else {
            reply.view('not-england')
          }
        })
      }
    },
    validate: {
      query: {
        place: Joi.string().allow('')
      }
    }
  }
}
