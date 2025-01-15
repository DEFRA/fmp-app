const { config } = require('../../../config')
const { queryFeatures } = require('@esri/arcgis-rest-feature-service')
const { getEsriToken } = require('./getEsriToken')

const makePointGeometry = (x, y) => ({ x, y, spatialReference: { wkid: 27700 } })

const makePolygonGeometry = (polygon) => {
  polygon = Array.isArray(polygon) ? polygon : JSON.parse(polygon)
  return {
    rings: [polygon],
    spatialReference: { wkid: 27700 }
  }
}

const esriRequest = async (endPoint, geometry, geometryType) => {
  const esriToken = await getEsriToken()
  const requestObject = {
    url: `${config.agol.serviceUrl}${endPoint}`,
    geometry,
    geometryType,
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: 'false',
    authentication: esriToken,
    outFields: '*'
  }
  // console.dir(requestObject, { depth: null })
  const result = await queryFeatures(requestObject)
  return result.features
}

module.exports = { esriRequest, makePointGeometry, makePolygonGeometry }
