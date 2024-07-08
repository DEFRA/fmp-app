const util = require('../util')
const config = require('../../config')
const { osNamesUrl, osSearchKey } = config.ordnanceSurvey
const fqFilter =
  'LOCAL_TYPE:City%20LOCAL_TYPE:Hamlet%20LOCAL_TYPE:Other_Settlement%20LOCAL_TYPE:Suburban_Area%20LOCAL_TYPE:Town%20LOCAL_TYPE:PostCode%20LOCAL_TYPE:Village'

// FCRM-4460 was to fix searches for large towns and cities with Proper Names that differ from their common names.
// The first attempt was to try and make a match on the data returned from OS Names, but this only worked for Brighton,
// as it is a place in it's own right (although the OS Place Names returns a village in Cornwall as the top result).
// This is a less than ideal workaround, that hard codes specific results, if any more are found they need to be added to this list.
const shortNames = {
  brighton: 'Brighton and Hove',
  newcastle: 'Newcastle upon Tyne',
  stockton: 'Stockton-on-Tees'
}

const replaceCommonSearchTerms = (place) =>
  shortNames[place?.toLowerCase()] || place

module.exports = {
  findByPlace: async (place) => {
    const uri =
      `${osNamesUrl}${place}&key=${osSearchKey}&fq=${fqFilter}`.replace(
        'maxresults=1&',
        'maxresults=10&'
      )
    const payload = await util.getJson(uri)

    console.log(
      `====findbyPlace OS===========place searched ${place}==================`
    )
    console.log(JSON.stringify(payload?.results))
    console.log('====================================')

    place = replaceCommonSearchTerms(place) // FCRM-4460 - see comment above
    if (!payload || !payload?.results || !payload.results?.length) {
      return []
    }
    const gazetteerEntries = payload?.results
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
          .filter((itemad, idx) => {
            return locationArray[idx - 1] !== itemad
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
  },
  getPostcodeFromEastingorNorthing: async (easting, northing) => {
    try {
      console.log('About to: getPostcodeFromEastingorNorthing')
      const uri = `${config.placeApi?.url}?point=${easting},${northing}&key=${config.ordnanceSurvey.osSearchKey}`
      const payload = await util.getJson(uri)
      if (!payload || !payload?.results[0]) {
        console.error(
          `=======================================unable to get postcode for easting :${easting} and northing: ${northing} but continuing operation======================`
        )
      } else {
        console.log('postcode retrieved', JSON.stringify(payload?.results[0]))
      }
      return payload?.results && payload?.results.length > 0
        ? payload?.results[0]?.DPA?.POSTCODE
        : ''
    } catch (error) {
      console.error(
        `unable to get postcode for easting :${easting} and northing: ${northing}`,
        JSON.stringify(error)
      )
    }
  }
}
