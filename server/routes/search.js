var Boom = require('boom')
var errors = require('../models/errors.json')
var addressService = require('../services/address')
var MapsViewModel = require('../models/maps-view')

module.exports = {
  method: 'GET',
  path: '/search',
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

        reply.view('map', new MapsViewModel(easting, northing))
      })
    }
  }
}
