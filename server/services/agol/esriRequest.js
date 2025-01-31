const { config } = require('../../../config')
const { queryFeatures } = require('@esri/arcgis-rest-feature-service')
const { getEsriToken } = require('./getEsriToken')

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
  return (await queryFeatures(requestObject)).features
}

module.exports = { esriRequest }
