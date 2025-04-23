const { config } = require('../../../config')
const { esriRequest } = require('./')
const turf = require('@turf/turf')

const errorMessage = 'Invalid response from AGOL customerTeam request'

const getCustomerTeam = (options) => {
  const response = {
    isEngland: false,
    EmailAddress: '',
    AreaName: '',
    useAutomatedService: false
  }

  return esriRequest(config.agol.customerTeamEndPoint, options.geometry, options.geometryType)
    .then(async (esriResult) => {
    // Note This request WILL NOT return data for areas that are outside of England
      if (!esriResult || !Array.isArray(esriResult)) {
        console.log(errorMessage, 'response was', esriResult)
        throw new Error(errorMessage)
      }
      response.isEngland = esriResult.length > 0
      // FCRM-5361 - If more than 1 result found, re-request with geometry and sort by intersecting area size
      if (esriResult.length > 1) {
        const turfPolygon = turf.polygon(options.geometry.rings)
        console.log('polygon area', turf.area(turfPolygon))
        esriResult = await esriRequest(config.agol.customerTeamEndPoint, options.geometry, options.geometryType, 'true')
          .then((esriResult) => esriResult.map((result) => {
            const areaPolygon = turf.polygon(result.geometry.rings)
            const intersection = turf.intersect(turfPolygon, areaPolygon)
            const area = turf.area(intersection)
            return { ...result, area }
          })).then((esriResult) => esriResult.sort((a, b) => {
            const sortValue = b.area - a.area
            console.log('a.area, b.area, sortValue: ', a.area, b.area, sortValue)
            return sortValue
          }))
      }
      const { attributes } = esriResult[0]
      // console.log('\ncustomerTeam Results ', esriResult)
      return Object.assign(response, {
        EmailAddress: attributes.contact_email,
        AreaName: attributes.area_name_1, // This will change back to area_name once Paul fixes the data.
        useAutomatedService: Boolean(attributes.use_automated_service)
      })
    }).catch((error) => {
      console.log('Error thrown in getCustomerTeam', error)
      throw error
    })
}

module.exports = { getCustomerTeam }
