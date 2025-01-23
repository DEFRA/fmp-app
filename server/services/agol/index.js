const { config } = require('../../../config')
const { request } = require('@esri/arcgis-rest-request')
const { getEsriToken } = require('./getEsriToken')
const { esriRequest } = require('./esriRequest')

const makePointGeometry = (x, y) => ({ x, y, spatialReference: { wkid: 27700 } })

const makePolygonGeometry = (polygon) => {
  polygon = Array.isArray(polygon) ? polygon : JSON.parse(polygon)
  return {
    rings: [polygon],
    spatialReference: { wkid: 27700 }
  }
}

const esriRestRequest = async (endPoint, geometry, geometryType, layerDefs) => {
  const esriToken = await getEsriToken()
  const url = `${config.agol.serviceUrl}${endPoint}/query`
  const requestObject = {
    httpMethod: 'GET',
    authentication: esriToken,
    params: {
      layerDefs,
      geometry,
      geometryType,
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry: 'false',
      returnCountOnly: 'true'
    }
  }
  const result = await request(url, requestObject)
  return result
}

module.exports = { esriRequest, esriRestRequest, makePointGeometry, makePolygonGeometry }
