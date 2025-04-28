const { config } = require('../../../config')
const { request } = require('@esri/arcgis-rest-request')
const { getEsriToken } = require('./getEsriToken')
const { esriStatusCodes } = require('../../constants')
const turf = require('@turf/turf')

const esriRequest = async (endPoint, geometry, geometryType, returnGeometry = 'false') => {
  const { token } = await getEsriToken()
  const url = `${config.agol.serviceUrl}${endPoint}/query`
  const requestObject = {
    httpMethod: 'POST',
    authentication: token,
    params: {
      geometry,
      geometryType,
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry,
      outFields: '*'
    }
  }

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

const esriRequestByIntersectArea = async (endPoint, geometry, geometryType) => {
  const response = await esriRequest(endPoint, geometry, geometryType)
  if (Array.isArray(response) && response?.length > 1) {
    // FCRM-5361 - If more than 1 result found, re-request with geometry and sort by intersecting area size
    const turfPolygon = turf.polygon(geometry.rings)
    return esriRequest(endPoint, geometry, geometryType, 'true')
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

module.exports = { esriRequest, esriRequestByIntersectArea }
