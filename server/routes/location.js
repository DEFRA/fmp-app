const Joi = require('joi')
const QueryString = require('querystring')
const addressService = require('../services/address')
const LocationViewModel = require('../models/location-view')
const ngrToBng = require('../services/ngr-to-bng')
const { object } = require('@hapi/joi')
const ngrRegEx = /^((([sS]|[nN])[a-hA-Hj-zJ-Z])|(([tT]|[oO])[abfglmqrvwABFGLMQRVW])|([hH][l-zL-Z])|([jJ][lmqrvwLMQRVW]))([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?$/

module.exports = [{
  method: 'GET',
  path: '/location',
  options: {
    auth: {
      strategy: 'restricted'
    }
  },
  handler: async (request, h) => {
    var errors = []
    var model = new LocationViewModel({
      errorSummary: errors
    })
    return h.view('location', model)
  }
},
{
  method: 'POST',
  path: '/location',
  options: {
    auth: {
      strategy: 'restricted'
    }
  },
  handler: async (request, h) => {
    try {
      const queryParams = {}
      let BNG = {}
      let model = {}

      const payload = request.payload

      // Find the Selected Option
      const selectedOption = payload.findby

      // If its Place or Postcode
      if (selectedOption === 'placeOrPostcode') {
        if (payload.placeOrPostcode !== '') {
          const address = await addressService.findByPlace(payload.placeOrPostcode)
          if (!address || !address.length || !address[0].geometry_x || !address[0].geometry_y) {
            throw new Error('No address found')
          }
          const addr = address[0]
          BNG.easting = addr.geometry_x
          BNG.northing = addr.geometry_y
        } else {
          const errors = [{ text: 'Place Or Postcode is Required', href: '#placeOrPostcode' }]
          model = new LocationViewModel({
            errorSummary: errors
          })
          return h.view('location', model)
        }
      }

      // If NGR Reference
      else if (selectedOption === 'nationalGridReference') {
        if (payload.nationalGridReference !== '') {
          BNG = ngrToBng.convert(payload.nationalGridReference)
        } else {
          const errors = [{ text: 'National Grid Reference is Requered', href: '#nationalGridReference' }]
          model = {}
          model = new LocationViewModel({
            errorSummary: errors
          })
          return h.view('location', model)
        }
      }

      // If Easting and Northing
      else if (selectedOption === 'eastingNorthing') {
        if (payload.easting !== '' && payload.northing !== '') {
          BNG.easting = payload.easting
          BNG.northing = payload.northing
        } else if (payload.easting === '' && payload.northing === '') {
          const errors = [
            { text: 'Easting is Required', href: '#easting' },
            { text: 'Northing is Required', href: '#northing' }
          ]
          model = {}
          model = new LocationViewModel({
            errorSummary: errors
          })
          return h.view('location', model)
        } else if (payload.easting === '') {
          const errors = [
            { text: 'Easting is Required', href: '#easting' }
          ]
          model = {}
          model = new LocationViewModel({ errorSummary: errors })
          return h.view('location', model)
        } else if (payload.northing === '') {
          const errors = [
            { text: 'Northing is Required', href: '#northing' }
          ]
          model = {}
          model = new LocationViewModel({ errorSummary: errors })
          return h.view('location', model)
        } else {

        }
      }

      queryParams.easting = BNG.easting || ''
      queryParams.northing = BNG.northing || ''
      // if the search wasn't by E/N include the original search in the query params
      if (selectedOption === 'nationalGridReference') {
        queryParams.nationalGridReference = payload.nationalGridReference
      } else if (selectedOption === 'placeOrPostcode') {
        queryParams.placeOrPostcode = payload.placeOrPostcode
      }

        const query = QueryString.stringify(queryParams)
        return h.redirect(`/confirm-location?${query}`)
      }
     catch (error) {

    }
  }
}
]
