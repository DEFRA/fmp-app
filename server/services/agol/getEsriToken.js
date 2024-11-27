const { config } = require('../../../config')
const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')

// getAppManager is wrapped in a getter so it is initialised at 1st use, to stop test failures
// when it is initialised at include time.
let _appManagerInstance
const getAppManager = () => {
  if (!_appManagerInstance) {
    _appManagerInstance = ApplicationCredentialsManager.fromCredentials({
      clientId: config.agol.clientId,
      clientSecret: config.agol.clientSecret
    })
  }
  return _appManagerInstance
}

const getEsriToken = async () => {
  const appManager = getAppManager()
  if (appManager.token) {
    return appManager.token
  }
  return await appManager.refreshToken()
}

module.exports = { getEsriToken }
