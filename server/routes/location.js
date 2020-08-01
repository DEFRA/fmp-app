const QueryString = require('querystring')
const addressService = require('../services/address')
const LocationViewModel = require('../models/location-view')
const ngrToBng = require('../services/ngr-to-bng')
const ngrRegEx = /^((([sS]|[nN])[a-hA-Hj-zJ-Z])|(([tT]|[oO])[abfglmqrvwABFGLMQRVW])|([hH][l-zL-Z])|([jJ][lmqrvwLMQRVW]))([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?([0-9]{2})?$/
const ngrPlaceOrPostcode = /^[a-zA-Z][a-zA-Z0-9 ]*$/

module.exports = [{
  method: 'GET',
  path: '/location',
  options: {
    description: 'Get location for a postcode, national grid reference, easting or northing',
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
    description: 'Get location for a postcode, national grid reference, easting or northing',
    auth: {
      strategy: 'restricted'
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
          const validPlaceOrPostcode = ngrPlaceOrPostcode.test(payload.placeOrPostcode)
          if ((payload.placeOrPostcode && payload.placeOrPostcode.trim()) && validPlaceOrPostcode) {
            const address = await addressService.findByPlace(payload.placeOrPostcode)
            if (!address || !address.length || !address[0].geometry_x || !address[0].geometry_y) {
              const errors = [{ text: 'You need to provide valid  Place or postcode', href: '#placeOrPostcode' }]
              model = new LocationViewModel({
                errorSummary: errors,
                placeOrPostcodeSelected: true,
                eastingNorthingSelected: false,
                nationalGridReferenceSelected: false,
                placeOrPostcode: payload.placeOrPostcode,
                nationalGridReference: payload.nationalGridReference,
                placeOrPostcodeError: { text: 'No address found for that Place or postcode' }
              })
              return h.view('location', model)
            }
            const addr = address[0]
            BNG.easting = addr.geometry_x
            BNG.northing = addr.geometry_y
          } else {
            const errors = [{ text: 'You need to give a valid Place or postcode', href: '#placeOrPostcode' }]
            model = new LocationViewModel({
              errorSummary: errors,
              placeOrPostcodeSelected: true,
              eastingNorthingSelected: false,
              nationalGridReferenceSelected: false,
              placeOrPostcode: payload.placeOrPostcode,
              nationalGridReference: payload.nationalGridReference,
              placeOrPostcodeError: { text: 'You need to give a valid Place or postcode' }
            })
            return h.view('location', model)
          }
        }
        // If NGR Reference
        else if (selectedOption === 'nationalGridReference') {
          if (payload.nationalGridReference !== '' && ngrRegEx.test(payload.nationalGridReference)) {
            BNG = ngrToBng.convert(payload.nationalGridReference)
          } else {
            const errors = [{ text: 'You need to give a valid National Grid Reference (NGR)', href: '#nationalGridReference' }]
            model = {}
            model = new LocationViewModel({
              errorSummary: errors,
              placeOrPostcodeSelected: false,
              eastingNorthingSelected: false,
              nationalGridReferenceSelected: true,
              placeOrPostcode: payload.placeOrPostcode,
              nationalGridReference: payload.nationalGridReference,
              nationalGridReferenceError: { text: 'You need to give a valid National Grid Reference (NGR)' }
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
              { text: 'You need to give an Easting', href: '#easting' },
              { text: 'You need to give a Northing', href: '#northing' }
            ]
            model = {}
            model = new LocationViewModel({
              errorSummary: errors,
              placeOrPostcodeSelected: false,
              eastingNorthingSelected: true,
              nationalGridReferenceSelected: false,
              easting: payload.easting,
              northing: payload.northing,
              placeOrPostcode: payload.placeOrPostcode,
              nationalGridReference: payload.nationalGridReference,
              eastingError: { text: 'You need to give an Easting' },
              northingError: { text: 'You need to give a Northing' }
            })
            return h.view('location', model)
          } else if (payload.easting === '') {
            const errors = [
              { text: 'You need to give an Easting', href: '#easting' }
            ]
            model = {}
            model = new LocationViewModel({
              errorSummary: errors,
              placeOrPostcodeSelected: false,
              eastingNorthingSelected: true,
              nationalGridReferenceSelected: false,
              northing: payload.northing,
              placeOrPostcode: payload.placeOrPostcode,
              nationalGridReference: payload.nationalGridReference,
              eastingError: { text: 'You need to give an Easting' }
            })
            return h.view('location', model)
          } else if (payload.northing === '') {
            const errors = [
              { text: 'You need to give a Northing', href: '#northing' }
            ]
            model = {}
            model = new LocationViewModel({
              errorSummary: errors,
              placeOrPostcodeSelected: false,
              eastingNorthingSelected: true,
              nationalGridReferenceSelected: false,
              easting: payload.easting,
              placeOrPostcode: payload.placeOrPostcode,
              nationalGridReference: payload.nationalGridReference,
              northingError: { text: 'You need to a give Northing' }

            })
            return h.view('location', model)
          } else {

          }
        } else {
          const errors = [{ text: 'Please select an option, Place or postcode or National Grid Reference(NGR) or Easting and Northing', href: '#findby' }]
          model = {}
          model = new LocationViewModel({
            errorSummary: errors
          })
          return h.view('location', model)
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
      } catch (error) {
      }
    }
  }
}]
