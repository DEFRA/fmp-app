var Boom = require('boom')
var Joi = require('joi')
var errors = require('../models/errors.json')
var addressService = require('../services/address')
var ngrToBngService = require('../services/ngr-to-bng')
var ConfirmLocationViewModel = require('../models/confirm-location-view')
var ngrRegEx = /^((([sS]|[nN])[a-hA-Hj-zJ-Z])|(([tT]|[oO])[abfglmqrvwABFGLMQRVW])|([hH][l-zL-Z])|([jJ][lmqrvwLMQRVW]))([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?$/

module.exports = {
  method: 'GET',
  path: '/confirm-location',
  config: {
    description: 'Get place search results',
    handler: function (request, reply) {
      var term = request.query.place

      if (!term) {
        return reply.redirect('/?err=place')
      }

      if (ngrRegEx.test(term)) {
        var bng = ngrToBngService(term)
        if (!bng.easting || !bng.northing) {
          // if ngr fails to return then try as an address
          address(term)
        } else {
          success(new ConfirmLocationViewModel(bng.easting, bng.northing))
        }
      } else {
        address(term)
      }

      // Helper functions
      function success (viewModel) {
        reply.view('confirm-location', viewModel)
      }

      function failure () {
        reply.redirect('/?err=place')
      }

      function address (term) {
        addressService.findByPlace(term, function (err, gazetteerEntries) {
          if (err) {
            return reply(Boom.badRequest(errors.placeSearch.message, err))
          }

          if (!gazetteerEntries.length || !gazetteerEntries[0].geometry_x || !gazetteerEntries[0].geometry_y) {
            failure()
          } else {
            success(new ConfirmLocationViewModel(gazetteerEntries[0].geometry_x, gazetteerEntries[0].geometry_y))
          }
        })
      }
    },
    validate: {
      query: {
        place: Joi.string().allow('') // TODO: Need to add some validation here to ensure no injection
      }
    }
  }
}
