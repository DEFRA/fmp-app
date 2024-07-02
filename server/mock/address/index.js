const addressService = require('../../services/address')
const findByPlace = require('./find-by-place')

addressService.findByPlace = async (place) => {
  const payload = findByPlace[place.replace('%20', '')].addressPayload
  if (!payload) {
    throw new Error(`findByPlace mock not found for place [${place}]`)
  }
  const gazetteerEntries = payload.results
    .map(function (item) {
      const {
        NAME1,
        POPULATED_PLACE,
        DISTRICT_BOROUGH,
        COUNTY_UNITARY,
        REGION,
        COUNTRY,
        LOCAL_TYPE
      } = item.GAZETTEER_ENTRY || {}
      const locationArray = [
        NAME1,
        POPULATED_PLACE,
        DISTRICT_BOROUGH,
        COUNTY_UNITARY,
        REGION,
        COUNTRY
      ].filter((itema) => itema) // Remove undefined entries

      const locationDetails = locationArray
        .filter((item, idx) => {
          return locationArray[idx - 1] !== item
        })
        .join(', ') // Remove duplicate entries

      return {
        geometry_x: item.GAZETTEER_ENTRY.GEOMETRY_X,
        geometry_y: item.GAZETTEER_ENTRY.GEOMETRY_Y,
        locationDetails,
        isPostCode: LOCAL_TYPE === 'Postcode',
        exact: (NAME1 || '').toLowerCase() === place.toLowerCase() ? 1 : 0
      }
    })
    .sort((a, b) => b.exact - a.exact) // Sort so that exact matches come first, solves the chester returning chester-le-street issue
  return gazetteerEntries
}

addressService.getPostcodeFromEastingorNorthing = async (easting, northing) => {
  console.log(easting + northing)
  return 'YO18 2NN'
}
