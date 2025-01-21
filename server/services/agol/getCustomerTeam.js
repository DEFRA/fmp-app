const { config } = require('../../../config')
const { esriRequest } = require('./')

const getCustomerTeam = (options) => {
  const response = {
    isEngland: false,
    EmailAddress: '',
    AreaName: '',
    useAutomatedService: false
  }
  return esriRequest(config.agol.customerTeamEndPoint, options.geometry, options.geometryType)
    .then((esriResult) => {
    // Note This request WILL NOT return data for areas that are outside of England
      if (!esriResult || !Array.isArray(esriResult)) {
        throw new Error('Invalid response from AGOL customerTeam request')
      }
      response.isEngland = esriResult.length > 0
      const { attributes } = esriResult[0]
      // console.log('\ncustomerTeam Results ', esriResult)
      Object.assign(response, {
        EmailAddress: attributes.contact_email,
        AreaName: attributes.area_name_1, // This will change back to area_name once Paul fixes the data.
        useAutomatedService: Boolean(attributes.use_automated_service)
      })
    })
}

module.exports = { getCustomerTeam }
