const { config } = require('../../../config')
const { request } = require('@esri/arcgis-rest-request')
const { getEsriToken, INVALID_TOKEN_CODE } = require('./getEsriToken')

const esriRestRequest = async (endPoint, geometry, geometryType, layerDefs) => {
  const { token } = await getEsriToken()
  const url = `${config.agol.serviceUrl}${endPoint}/query`
  const requestObject = {
    httpMethod: 'GET',
    authentication: token,
    params: {
      layerDefs,
      geometry,
      geometryType,
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry: 'false',
      returnCountOnly: 'true'
    }
  }

  try {
    return await request(url, requestObject)
  } catch (error) {
    if (error?.response?.error?.code !== INVALID_TOKEN_CODE) {
      throw error
    }
    const { token: newToken } = await getEsriToken(true) // true implies forceRefresh
    requestObject.authentication = newToken
    return request(url, requestObject)
  }
}

module.exports = { esriRestRequest }
