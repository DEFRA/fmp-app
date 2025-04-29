const { config } = require('../../../config')
const { esriFeatureRequestByIntersectArea } = require('./')

const errorMessage = 'Invalid response from AGOL customerTeam request'

const getCustomerTeam = (options) => {
  const response = {
    isEngland: false,
    EmailAddress: '',
    AreaName: '',
    useAutomatedService: false
  }

  return esriFeatureRequestByIntersectArea(config.agol.customerTeamEndPoint, options.geometry, options.geometryType)
    .then((esriResult) => {
      // Note This request WILL NOT return data for areas that are outside of England
      if (!esriResult || !Array.isArray(esriResult)) {
        console.log(errorMessage, 'response was', esriResult)
        throw new Error(errorMessage)
      }
      response.isEngland = esriResult.length > 0
      const { attributes } = esriResult[0]
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
