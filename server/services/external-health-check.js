const axios = require('axios')
const { config } = require('../../config')

const GIT_REVISION_LENGTH = 7

const environmentName = (env) => ({
  dev: 'Development',
  test: 'Test',
  pre: 'Pre-Production',
  'prod-green': 'Production Green',
  'prod-blue': 'Production Blue'
}[env])

const NOT_AVAILABLE = 'not available'

const getExternalVersion = async (url, name) => {
  try {
    const { data = {} } = await axios.get(url)
    const { version = '', revision = '', environment = '' } = data
    return {
      version,
      revision: revision.substring(0, GIT_REVISION_LENGTH),
      environment: environmentName(environment)
    }
  } catch (error) {
    console.log(`error fetching ${name} health-check`, url, error)
  }
  return {
    version: NOT_AVAILABLE,
    revision: NOT_AVAILABLE,
    environment: NOT_AVAILABLE
  }
}

const getFmpApiVersion = async () => getExternalVersion(config.functionAppUrl + '/health-check', 'fmp-api')

module.exports = { getFmpApiVersion }
