const geometry = {
  rings: [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]],
  spatialReference: { wkid: 27700 }
}

const params = {
  geometry,
  geometryType: 'esriGeometryPolygon',
  spatialRel: 'esriSpatialRelIntersects',
  returnGeometry: 'false',
  outFields: '*'
}

const expectedParameters = {
  url: 'https://services1.arcgis.com/DUMMY_SERVICE_ID/arcgis/rest/services/endpoint/query',
  requestObject: {
    httpMethod: 'POST',
    authentication: 'TEST_TOKEN',
    params
  }
}

module.exports = {
  geometry, params, expectedParameters
}
