const QueryString = require('querystring')
const addressService = require('../services/address')
const isValidEastingNorthingService = require('../services/is-valid-easting-northing')
const isValidNgrService = require('../services/is-valid-ngr')
const LocationViewModel = require('../models/location-view')
const ngrToBng = require('../services/ngr-to-bng')
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
              const errors = [{ text: 'Enter a real place name or postcode', href: '#placeOrPostcode' }]
              model = new LocationViewModel({
                errorSummary: errors,
                placeOrPostcodeSelected: true,
                eastingNorthingSelected: false,
                nationalGridReferenceSelected: false,
                placeOrPostcode: payload.placeOrPostcode,
                nationalGridReference: payload.nationalGridReference,
                placeOrPostcodeError: { text: 'No address found for that place or postcode' }
              })
              return h.view('location', model)
            }
            const addr = address[0]
            BNG.easting = addr.geometry_x
            BNG.northing = addr.geometry_y
          } else {
            const errors = [{ text: 'Enter a real place name or postcode', href: '#placeOrPostcode' }]
            model = new LocationViewModel({
              errorSummary: errors,
              placeOrPostcodeSelected: true,
              eastingNorthingSelected: false,
              nationalGridReferenceSelected: false,
              placeOrPostcode: payload.placeOrPostcode,
              nationalGridReference: payload.nationalGridReference,
              placeOrPostcodeError: { text: 'Enter a real place name or postcode' }
            })
            return h.view('location', model)
          }
        }
        // If NGR Reference
        else if (selectedOption === 'nationalGridReference') {
          var isNGrValid = await isValidNgrService.get(payload.nationalGridReference)
          if (isNGrValid.isValid) {
            BNG = ngrToBng.convert(payload.nationalGridReference)
          } else {
            const errors = [{ text: 'Enter a real National Grid Reference (NGR)', href: '#nationalGridReference' }]
            model = {}
            model = new LocationViewModel({
              errorSummary: errors,
              placeOrPostcodeSelected: false,
              eastingNorthingSelected: false,
              nationalGridReferenceSelected: true,
              placeOrPostcode: payload.placeOrPostcode,
              nationalGridReference: payload.nationalGridReference,
              nationalGridReferenceError: { text: 'Enter a real National Grid Reference (NGR)' }
            })
            return h.view('location', model)
          }
        }
        // If Easting and Northing
        else if (selectedOption === 'eastingNorthing') {
          const formattedEasting = payload.easting ? payload.easting.trim().replace(/\s+/g, '') : ''
          const formattedNorthing = payload.northing ? payload.northing.trim().replace(/\s+/g, '') : ''
          const eastingNorthingResponse = await isValidEastingNorthingService.get(formattedEasting, formattedNorthing)
          if (eastingNorthingResponse.isValid) {
            BNG.easting = formattedEasting
            BNG.northing = formattedNorthing
          } else {
            const errors = [
              { text: eastingNorthingResponse.eastingError, href: '#easting' },
              { text: eastingNorthingResponse.northingError, href: '#northing' }
            ]
            if (!eastingNorthingResponse.northing.isValid && !eastingNorthingResponse.easting.isValid) {
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
                eastingError: { text: eastingNorthingResponse.eastingError },
                northingError: { text: eastingNorthingResponse.northingError }
              })
            } else if (!eastingNorthingResponse.northing.isValid) {
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
                northingError: { text: eastingNorthingResponse.northingError }
              })
            } else {
              model = new LocationViewModel({
                errorSummary: errors,
                placeOrPostcodeSelected: false,
                eastingNorthingSelected: true,
                nationalGridReferenceSelected: false,
                easting: payload.easting,
                northing: payload.northing,
                placeOrPostcode: payload.placeOrPostcode,
                nationalGridReference: payload.nationalGridReference,
                eastingError: { text: eastingNorthingResponse.eastingError }
              })
            }
            return h.view('location', model)
          }
        } else {
          const errors = [{ text: 'Select a place or postcode, National Grid Reference (NGR) or an Easting and northing', href: '#findby' }]
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
        queryParams.recipientemail = 'notset'
        queryParams.fullName = 'notset'

        const query = QueryString.stringify(queryParams)
        return h.redirect(`/confirm-location?${query}`)
      } catch (error) {
      }
    }
  }
}]
