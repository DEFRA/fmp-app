const { config } = require('../../../config')
const { getCentreOfPolygon } = require('../../services/shape-utils')
const riskAdminApiUrl = config.riskAdminApi.url
const axios = require('axios')

const isRiskAdminArea = async (polygon) => {
  const { x, y } = getCentreOfPolygon(polygon)
  const url = `${riskAdminApiUrl}/extra_info/${x}/${y}`

  try {
    const { data } = await axios.get(url)
    console.log('isRiskAdminArea - data:\n', data, '\n')

    const response = {
      isRiskAdminArea: Array.isArray(data) ? data.length > 0 : data
    }

    console.log('isRiskAdminArea - response:\n', response, '\n')
    return response
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
