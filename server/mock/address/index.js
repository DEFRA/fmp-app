const addressService = require('../../services/address')
const findByPlace = require('./find-by-place')

addressService.findByPlace = async (place) => {
  const result = findByPlace[place]
  if (!result) {
    throw new Error(`findByPlace mock not found for place [${place}]`)
  } else {
    return result
  }
}
