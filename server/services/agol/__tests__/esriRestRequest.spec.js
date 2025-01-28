const { esriRestRequest } = require('../esriRestRequest')
const { requestSpy } = require('@esri/arcgis-rest-request')
const { config } = require('../../../../config')

const geometry = {
  rings: [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]],
  spatialReference: { wkid: 27700 }
}

const layerDefs = { 0: '', 1: '', 2: '' }

const expectedResponse = {
  layers: [
    {
      id: 0,
      count: 0
    }, {
      id: 1,
      count: 0
    }, {
      id: 2,
      count: 0
    }
  ]
}

describe('esriRestRequest', () => {
  it('should call esriRestRequest with the expected object and return mocked object', async () => {
    requestSpy.expectParameters({
      url: `${config.agol.serviceUrl}/endpoint/query`,
      requestObject: {
        httpMethod: 'GET',
        authentication: 'TEST_TOKEN',
        params: {
          layerDefs,
          geometry,
          geometryType: 'esriGeometryPolygon',
          spatialRel: 'esriSpatialRelIntersects',
          returnGeometry: 'false',
          returnCountOnly: 'true'
        }
      }
    })
    const response = await esriRestRequest('/endpoint', geometry, 'esriGeometryPolygon', layerDefs)
    expect(response).toEqual(expectedResponse)
  })
})
