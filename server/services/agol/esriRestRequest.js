const { config } = require('../../../config')
const { request } = require('@esri/arcgis-rest-request')
const { getEsriToken } = require('./getEsriToken')

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
  return request(url, requestObject)
}

module.exports = { esriRestRequest }
