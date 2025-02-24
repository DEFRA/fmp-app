const { config } = require('../../../config')
const riskAdminApiUrl = config.riskAdminApi.url
const axios = require('axios')
const http = require('http')
const https = require('https')
const protocol = new URL(riskAdminApiUrl).protocol
const httpAgent = protocol === 'http:' ? new http.Agent({ keepAlive: true }) : undefined
const httpsAgent = protocol === 'https:' ? new https.Agent({ keepAlive: true }) : undefined

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const doRequest = async (url) => {
  const { data } = await axios.get(url, { httpsAgent, httpAgent })
  const { intersects } = data
  if (intersects !== undefined) {
    return { isRiskAdminArea: intersects }
  }
  console.log('riskadmin-api response data:\n', data)
  throw new Error('Unexpected response from riskadmin-api')
}

const isRiskAdminArea = async (polygon) => {
  // set forceRiskAdminApiResponse to true or false in your local env file
  // to test the results page without the need to run a local instance of riskadmin-api
  if (process.env.forceRiskAdminApiResponse !== undefined) {
    return { isRiskAdminArea: process.env.forceRiskAdminApiResponse === 'true' }
  }

  const url = `${riskAdminApiUrl}/hit-test?polygon=${polygon}`
  try {
    try {
      return await doRequest(url)
    } catch (error) {
      if (error.code === 'ECONNRESET') {
        const { message, name, code } = error
        console.log('1st Attempt Error requesting riskadmin-api data:\n', JSON.stringify({ url, message, name, code }))
        await wait(50)
        console.log('Doing attempt 2')
        return await doRequest(url)
      } else {
        throw error
      }
    }
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
