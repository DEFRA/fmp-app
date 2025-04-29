const { config } = require('../../../config')
const { request } = require('@esri/arcgis-rest-request')
const { getEsriToken } = require('./getEsriToken')
const { esriStatusCodes } = require('../../constants')
const turf = require('@turf/turf')

// Has outFields, no layerDefs and returnCountOnly
// returnGeometry is true OR false
const esriRequest = async (endPoint, geometry, geometryType, optionalParams = {}) => {
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
    return (await request(url, requestObject)).features
  } catch (error) {
    if (error?.response?.error?.code !== esriStatusCodes.INVALID_TOKEN_CODE) {
      throw error
    }
    // If the token is invalidated, try one more time with a refrehed token before throwing
    const { token: newToken } = await getEsriToken(true) // true implies forceRefresh
    requestObject.authentication = newToken
    return (await request(url, requestObject)).features
  }
}

const esriFeatureRequest = async (endPoint, geometry, geometryType, optionalParams = { returnGeometry: 'false' }) => {
  const params = {
    ...optionalParams,
    outFields: '*'
  }
  return esriRequest(endPoint, geometry, geometryType, params)
}

const esriFeatureRequestByIntersectArea = async (endPoint, geometry, geometryType) => {
  const response = await esriFeatureRequest(endPoint, geometry, geometryType)
  if (Array.isArray(response) && response?.length > 1) {
    // FCRM-5361 - If more than 1 result found, re-request with geometry and sort by intersecting area size
    const turfPolygon = turf.polygon(geometry.rings)
    return esriFeatureRequest(endPoint, geometry, geometryType, { returnGeometry: 'true' })
      .then((esriResult) => esriResult.map((result) => {
        try {
          const areaPolygon = turf.polygon(result.geometry.rings)
          const intersection = turf.intersect(turfPolygon, areaPolygon)
          const area = turf.area(intersection)
          return { ...result, area }
        } catch (error) {
          console.log('error when calculating area intersection:', error)
          return { ...result, area: 0 }
        }
      })).then((esriResult) => esriResult.sort((a, b) => b.area - a.area))
  }
  return response
}

module.exports = { esriRequest, esriFeatureRequest, esriFeatureRequestByIntersectArea }
