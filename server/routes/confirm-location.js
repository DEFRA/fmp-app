const Boom = require('@hapi/boom')
const Joi = require('joi')
const QueryString = require('querystring')
const isEnglandService = require('../services/is-england')
const ConfirmLocationViewModel = require('../models/confirm-location-view')

module.exports = [{
  method: 'GET',
  path: '/confirm-location',
  options: {
    description: 'Get confirm location page search results',
    handler: async (request, h) => {
      // if a request to the old url, which accepted the param place, was made forward to the homepage
      if (request.query.place) {
        const place = encodeURIComponent(request.query.place)
        // if (place) { // question - this line seems moot as it will always evaluate to true if request.query.place evaluates to true
        return h.redirect(`/?place=${place}`)
        // }
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
          return h.redirect('/england-only?' + queryString)
        }

        let location = ''
        if (request.query.placeOrPostcode || request.query.nationalGridReference) {
          location = request.query.placeOrPostcode ? request.query.placeOrPostcode : request.query.nationalGridReference
        } else { // if (request.query.easting && request.query.northing) { // This test is moot as we have already established that easting and northing are set
          location = `${request.query.easting} ${request.query.northing}`
        }
        let recipientemail = ' '
        if (request.query.recipientemail) {
          recipientemail = request.query.recipientemail
        }

        let fullName = ' '
        if (request.query.fullName) {
          fullName = request.query.fullName
        }
        let polygon
        try {
          polygon = request.query.polygon ? JSON.parse(request.query.polygon) : undefined
        } catch {
          return Boom.badRequest('Invalid polygon value passed')
        }

        const model = new ConfirmLocationViewModel(point.easting, point.northing, polygon, location, point.placeOrPostcode, recipientemail, fullName)

        return h.view('confirm-location', model)
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    },
    validate: {
      query: Joi.object().keys({
        easting: Joi.number().max(700000).positive(),
        northing: Joi.number().max(1300000).positive(),
        polygon: Joi.string(),
        place: Joi.string(),
        placeOrPostcode: Joi.string(),
        nationalGridReference: Joi.string(),
        recipientemail: Joi.string(),
        fullName: Joi.string()
      })
    }
  }
}]
