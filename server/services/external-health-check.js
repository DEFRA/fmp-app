const axios = require('axios')
const { config } = require('../../config')

const GIT_REVISION_LENGTH = 7

const getExternalVersion = async (url, name) => {
  try {
    const { data = {} } = await axios.get(url)
    const { version = '', revision = '' } = data
    return {
      version,
      revision: revision.substring(0, GIT_REVISION_LENGTH)
    }
  } catch (error) {
    console.log(`error fetching ${name} health-check`, url, error)
  }
  return {
    version: 'not available',
    revision: 'not available'
  }
}

const getFmpApiVersion = async () => getExternalVersion(config.functionAppUrl + '/health-check', 'fmp-api')

module.exports = { getFmpApiVersion }
