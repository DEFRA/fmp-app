const Boom = require('@hapi/boom')
const Joi = require('joi')
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
        return h.redirect(`/?place=${place}`)
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
          const queryString = new URLSearchParams(request.query).toString()
          return h.redirect('/england-only?' + queryString)
        }
        // getPsoContacts will throw an error if not in england, so this call must be after the is-england redirect
        const contactDetails = await request.server.methods.getPsoContacts(point.easting, point.northing)

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
        let { locationDetails = '' } = request.query
        if (locationDetails) {
          locationDetails = locationDetails
            .replace(/, England$/, '')
            .replace((new RegExp(`^${point.placeOrPostcode}, `, 'i')), '')
        }
        const polygonMissing = Boolean(request.query.polygonMissing)
        const model = new ConfirmLocationViewModel(
          {
            easting: point.easting,
            northing: point.northing,
            polygon,
            location,
            placeOrPostcode: point.placeOrPostcode,
            recipientemail,
            fullName,
            locationDetails,
            contactDetails,
            polygonMissing
          })

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
        fullName: Joi.string(),
        locationDetails: Joi.string(),
        polygonMissing: Joi.boolean()
      })
    }
  }
}]
