const axios = require('axios')
const { config } = require('../../config')

const getExternalVersion = async (url, name) => {
  try {
    const { data = {} } = await axios.get(url)
    const { version = '', revision = '' } = data
    return {
      version,
      revision: revision.substring(0, 7)
    }
  } catch (error) {
    console.log(`error fetching ${name} health-check`, url, error)
  }
  return {
    version: 'not available',
    revision: 'not available'
  }
}

const getFmpServiceVersion = async () => getExternalVersion(config.service + '/health-check', 'fmp-service')
const getFmpApiVersion = async () => getExternalVersion(config.functionAppUrl + '/health-check', 'fmp-api')

module.exports = { getFmpServiceVersion, getFmpApiVersion }
