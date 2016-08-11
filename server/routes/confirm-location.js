var Boom = require('boom')
var Joi = require('joi')
var errors = require('../models/errors.json')
var addressService = require('../services/address')
var MapsViewModel = require('../models/maps-view')

module.exports = {
  method: 'GET',
  path: '/confirm-location',
  config: {
    description: 'Get place search results',
    handler: function (request, reply) {
      var place = request.query.place

      if (place == null) {
        return reply.redirect('/?err=placeSearch')
      }

      addressService.findByPlace(place, function (err, gazetteerEntries) {
        if (err) {
          return reply(Boom.badRequest(errors.placeSearch.message, err))
        }

        var easting = gazetteerEntries[0].geometry_x
        var northing = gazetteerEntries[0].geometry_y

        reply.view('confirm-location', new MapsViewModel(easting, northing))
      })
    },
    validate: {
      query: {
        place: Joi.string().required() // TODO: Need to add some validation here to ensure no injection
      }
    }
  }
}
