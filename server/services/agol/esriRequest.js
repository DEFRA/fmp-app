const { config } = require('../../../config')
const { request } = require('@esri/arcgis-rest-request')
const { getEsriToken } = require('./getEsriToken')
const { esriStatusCodes } = require('../../constants')

const esriRequest = async (endPoint, geometry, geometryType, optionalParams) => {
  const { token } = await getEsriToken()
  const url = `${config.agol.serviceUrl}${endPoint}/query`
  const params = {
    ...optionalParams,
    geometry,
    geometryType,
    spatialRel: 'esriSpatialRelIntersects'
  }

  const requestObject = { httpMethod: 'POST', authentication: token, params }

  try {
    return await request(url, requestObject)
  } catch (error) {
    if (error?.response?.error?.code !== esriStatusCodes.INVALID_TOKEN_CODE) {
      throw error
    }
    // If the token is invalidated, try one more time with a refrehed token before throwing
    const { token: newToken } = await getEsriToken(true) // true implies forceRefresh
    requestObject.authentication = newToken
    return request(url, requestObject)
  }
}

module.exports = { esriRequest }
