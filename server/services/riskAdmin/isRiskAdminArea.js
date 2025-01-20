const { config } = require('../../../config')
const { getCentreOfPolygon } = require('../../services/shape-utils')
const riskAdminApiUrl = config.riskAdminApi.url
const axios = require('axios')

const isRiskAdminArea = async (polygon) => {
  // set forceRiskAdminApiResponse to true or false in your local env file
  // to test the results page without the need to run a local instance of riskadmin-api
  if (process.env.forceRiskAdminApiResponse !== undefined) {
    return { isRiskAdminArea: process.env.forceRiskAdminApiResponse === 'true' }
  }

  const { x, y } = getCentreOfPolygon(polygon)
  const url = `${riskAdminApiUrl}/extra_info/${x}/${y}`

  try {
    const { data } = await axios.get(url)
    if (Array.isArray(data)) {
      const response = {
        isRiskAdminArea: data.length > 0
      }
      return response
    }
    console.log('riskadmin-api response data:\n', data)
    throw new Error('Unexpected response from riskadmin-api')
  } catch (error) {
    if (error.message) {
      const { message, name, code } = error
      console.log('Error requesting riskadmin-api data:\n', JSON.stringify({ url, message, name, code }))
    } else {
      console.log('Error requesting riskadmin-api data:\n', url, error)
    }
    throw (error)
  }
}

module.exports = { isRiskAdminArea }
