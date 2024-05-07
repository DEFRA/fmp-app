const addressService = require('../../services/address')
const findByPlace = require('./find-by-place')

addressService.findByPlace = async (place) => {
  const result = findByPlace[place.replace('%20', '').toUpperCase()]
  if (!result) {
    throw new Error(`findByPlace mock not found for place [${place}]`)
  } else {
    return result
  }
}

addressService.getPostcodeFromEastingorNorthing = async (easting, northing) => {
  if (easting === 12345 && northing === 678910) {
    return undefined
  } else {
    return 'WA1 2NN'
  }
}
