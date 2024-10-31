const { config } = require('../../../config')
const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
const { queryFeatures } = require('@esri/arcgis-rest-feature-service')

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

const aquireToken = async () => {
  const appManager = getAppManager()
  if (appManager.token) {
    return appManager.token
  }
  return await appManager.refreshToken()
}

const makePointGeometry = (x, y) => ({ x, y, spatialReference: { wkid: 27700 } })

const esriRequest = async (endPoint, geometry, geometryType) => {
  console.log('*****************esriRequest-called***************')
  const esriToken = await aquireToken()

  const result = await queryFeatures({
    url: `${config.agol.serviceUrl}/${endPoint}`,
    geometry,
    geometryType,
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: 'false',
    authentication: esriToken,
    outFields: '*'
  })
  return result.features
}

module.exports = { esriRequest, makePointGeometry }
