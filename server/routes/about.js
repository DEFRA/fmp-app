const { version, revision } = require('../../version')
const axios = require('axios')
const { config } = require('../../config')

const getFmpServiceVersion = async () => {
  const url = config.service + '/health-check'
  try {
    const { data = {} } = await axios.get(url)
    const { version = '', revision = '' } = data
    return {
      version,
      revision: revision.substring(0, 7)
    }
  } catch (error) {
    console.log('error fetching fmp-service health-check', url)
  }
  return {
    version: 'not available',
    revision: 'not available'
  }
}

const getFmpApiVersion = async () => {
  const url = config.functionAppUrl + '/health-check'
  try {
    const { data = {} } = await axios.get(url)
    const { version = '', revision = '' } = data
    return {
      version,
      revision: revision.substring(0, 7)
    }
  } catch (error) {
    console.log('error fetching fmp-api health-check', url, error)
  }
  return {
    version: 'not available',
    revision: 'not available'
  }
}

module.exports = {
  method: 'GET',
  path: '/about',
  options: {
    description: 'Describe application version number',
    handler: async (_request, h) => {
      // package.json must be included rather than at the top so that it can be mocked for testing
      // otherwise tests would need updating everytime the version changes
      // const { data: fmpService } = await axios.get(config.service + '/health-check')
      const fmpService = await getFmpServiceVersion()
      const fmpApi = await getFmpApiVersion()

      const data = {
        fmpApp: {
          version: version.substring(0, version.lastIndexOf('-')),
          revision: revision.substring(0, 7)
        },
        fmpService,
        fmpApi
      }
      return h.view('about', data)
    }
  }
}
