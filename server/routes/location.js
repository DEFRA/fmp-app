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
    var errors = {}
    errors.placeOrPostcode = ''
    errors.nationalGridReference = ''
    errors.easting = ''
    errors.northing = ''
    var errorSummaryModel = Object.values(errors)
    var model = new LocationViewModel({
      errorSummary: errorSummaryModel

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
    var errors = {}
    errors.placeOrPostcode = ''
    errors.nationalGridReference = ''
    errors.easting = ''
    errors.northing = ''
    var errorSummaryModel = Object.values(errors)
    const payload = request.payload
    // attempt to get BNG coordinates for the place or postcode
    let BNG = {}
    var selectedOption = payload.findby
    if (selectedOption === 'placeOrPostcode') {
      try {
        const address = await addressService.findByPlace(payload.placeorPostcode)
        if (!address || !address.length || !address[0].geometry_x || !address[0].geometry_y) {
          throw new Error('No address found')
        }
        const addr = address[0]
        BNG.easting = addr.geometry_x
        BNG.northing = addr.geometry_y
      } catch (err) {
        // return error view if E/N lookup by place or postcode fails
        request.log(['error', 'address-service', 'find-by-place'], err)
        const data = {
          type: 'placeOrPostcode',
          placeOrPostcode: payload.placeOrPostcode
        }
        const errors = [{
          path: ['placeOrPostcode']
        }]
        return h.view('location', new LocationViewModel(data, errors))
      }
    } else if (selectedOption === 'nationalGridReference') {
      BNG = ngrToBng.convert(payload.nationalGridReference)
    } else if (selectedOption === 'eastingNorthing') {
      BNG.easting = payload.easting
      BNG.northing = payload.northing
    }
    // redirect to the confirm location page with the BNG in the query
    const queryParams = {}
    queryParams.easting = BNG.easting || ''
    queryParams.northing = BNG.northing || ''
    // if the search wasn't by E/N include the original search in the query params
    if (payload.type === 'nationalGridReference') {
      queryParams.nationalGridReference = payload.nationalGridReference
    } else if (payload.type === 'placeOrPostcode') {
      queryParams.placeOrPostcode = payload.placeOrPostcode
    }
    const query = QueryString.stringify(queryParams)
    return h.redirect(`/confirm-location?${query}`)
  }
}
]
