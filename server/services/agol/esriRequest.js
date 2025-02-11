const { config } = require('../../../config')
const { queryFeatures } = require('@esri/arcgis-rest-feature-service')
const { getEsriToken } = require('./getEsriToken')
const { esriStatusCodes } = require('../../constants')

const esriRequest = async (endPoint, geometry, geometryType) => {
  const { token } = await getEsriToken()
  const requestObject = {
    url: `${config.agol.serviceUrl}${endPoint}`,
    geometry,
    geometryType,
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: 'false',
    authentication: token,
    outFields: '*'
  }

  try {
    return (await queryFeatures(requestObject)).features
  } catch (error) {
    if (error?.response?.error?.code !== esriStatusCodes.INVALID_TOKEN_CODE) {
      throw error
    }
    // If the token is invalidated, try one more time with a refrehed token before throwing
    const { token: newToken } = await getEsriToken(true) // true implies forceRefresh
    requestObject.authentication = newToken
    return (await queryFeatures(requestObject)).features
  }
}

module.exports = { esriRequest }
