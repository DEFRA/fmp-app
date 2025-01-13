const addressService = require('../services/address')
const isValidEastingNorthingService = require('../services/is-valid-easting-northing')
const isValidNgrService = require('../services/is-valid-ngr')
const ngrToBng = require('../services/ngr-to-bng')

const handlers = {
  get: async (_request, h) => h.view('location'),
  post: async (request, h) => {
    // Validate and process the payload
    const { BNG, errorSummary } = await validatePayload(request.payload)

    // If any validation failed then return the location view with the captured validation error
    if (errorSummary.length > 0) {
      // Get the analytics object
      return h.view('location', {
        ...request.payload,
        errorSummary,
        analyticsPageEvent: analyticsPageEvent(request.payload)
      })
    }

    return h.redirect(`/map?cz=${BNG.easting},${BNG.northing},15`)
  }
}

const validatePayload = async payload => {
  const BNG = {}
  const {
    findby,
    placeOrPostcode,
    nationalGridReference,
    easting,
    northing
  } = payload
  const errorSummary = []

  if (findby === 'placeOrPostcode') {
    await validatePlace(BNG, placeOrPostcode, errorSummary)
  } else if (findby === 'nationalGridReference') {
    validateGridReference(BNG, nationalGridReference, errorSummary)
  } else if (findby === 'eastingNorthing') {
    validateBNG(BNG, easting, northing, errorSummary)
  } else {
    errorSummary.push({
      text: 'Select a place or postcode, National Grid Reference (NGR) or an Easting and northing',
      href: '#findby'
    })
  }

  return {
    BNG,
    errorSummary
  }
}

const validatePlace = async (BNG, placeOrPostcode, errorSummary) => {
  placeOrPostcode = placeOrPostcode?.trim() || ''
  if (!validatePlaceOrPostcode(placeOrPostcode)) {
    errorSummary.push({
      text: 'Enter a real place name or postcode',
      href: '#placeOrPostcode'
    })
  } else {
    const address = await addressService.findByPlace(placeOrPostcode)
    if (!address || !address.length || !address[0].geometry_x || !address[0].geometry_y) {
      errorSummary.push({
        text: 'No address found for that place or postcode',
        href: '#placeOrPostcode'
      })
    } else {
      BNG.easting = address[0].geometry_x
      BNG.northing = address[0].geometry_y
    }
  }
}

const validateGridReference = (BNG, nationalGridReference, errorSummary) => {
  const isNGrValid = isValidNgrService.get(nationalGridReference || '')
  if (isNGrValid.isValid) {
    const convertedBNG = ngrToBng.convert(nationalGridReference)
    BNG.easting = convertedBNG.easting
    BNG.northing = convertedBNG.northing
  } else {
    errorSummary.push({
      text: 'Enter a real National Grid Reference (NGR)',
      href: '#nationalGridReference'
    })
  }
}

const validateBNG = (BNG, easting, northing, errorSummary) => {
  const formattedEasting = easting ? easting.trim().replace(/\s+/g, '') : ''
  const formattedNorthing = northing ? northing.trim().replace(/\s+/g, '') : ''
  const eastingNorthingResponse = isValidEastingNorthingService.get(formattedEasting, formattedNorthing)
  if (eastingNorthingResponse.isValid) {
    BNG.easting = formattedEasting
    BNG.northing = formattedNorthing
  } else {
    if (eastingNorthingResponse.eastingError) {
      errorSummary.push({
        text: eastingNorthingResponse.eastingError,
        href: '#easting'
      })
    }
    if (eastingNorthingResponse.northingError) {
      errorSummary.push({
        text: eastingNorthingResponse.northingError,
        href: '#northing'
      })
    }
  }
}

const validatePlaceOrPostcode = (placeOrPostcode) => {
  if (placeOrPostcode.length < 2) {
    return false
  }
  if (placeOrPostcode.length === 2) {
    return /^[a-zA-Z][0-9]$/.test(placeOrPostcode)
  }
  return /^[a-zA-Z][a-zA-Z0-9 !\-,']*$/.test(placeOrPostcode)
}

const analyticsPageEvent = payload => {
  let VALUE = ''
  let TYPE = ''

  if (payload.findby === 'placeOrPostcode') {
    VALUE = payload.placeOrPostcode
    TYPE = 'PLACENAME'
  }
  if (payload.findby === 'nationalGridReference') {
    VALUE = payload.nationalGridReference
    TYPE = 'NGR'
  }
  if (payload.findby === 'eastingNorthing') {
    VALUE = `${payload.easting}_${payload.northing}`
    TYPE = 'EASTINGS'
  }

  return JSON.stringify({
    event: 'SEARCH',
    parameters: {
      ERROR: true,
      VALUE,
      TYPE
    }
  })
}

module.exports = [
  {
    method: 'GET',
    path: '/location',
    options: {
      description: 'Get location for a postcode, national grid reference, easting or northing'
    },
    handler: handlers.get
  },
  {
    method: 'POST',
    path: '/location',
    options: {
      description: 'Get location for a postcode, national grid reference, easting or northing',
      handler: handlers.post
    }
  }
]
