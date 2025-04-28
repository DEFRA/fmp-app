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
  const params = {
    layerDefs,
    geometry,
    geometryType: 'esriGeometryPolygon',
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: 'false',
    returnCountOnly: 'true'
  }

  const expectedParameters = {
    url: `${config.agol.serviceUrl}/endpoint/query`,
    requestObject: {
      httpMethod: 'POST',
      authentication: 'TEST_TOKEN',
      params
    }
  }

  it('should call esriRestRequest with the expected object and return mocked object', async () => {
    requestSpy.expectParameters(expectedParameters)
    const response = await esriRestRequest('/endpoint', geometry, 'esriGeometryPolygon', layerDefs)
    expect(response).toEqual(expectedResponse)
  })

  it('should retry with a refreshed token after an invalid token response', async () => {
    requestSpy.throwOnce = true
    requestSpy.expectParameters(Object.assign({}, expectedParameters, {
      requestObject: { httpMethod: 'POST', authentication: 'REFRESHED_TOKEN', params }
    }))
    const response = await esriRestRequest('/endpoint', geometry, 'esriGeometryPolygon', layerDefs)
    expect(response).toEqual(expectedResponse)
  })

  it('should throw error other than invalid token response', async () => {
    requestSpy.throwUnexpected = true
    try {
      const response = await esriRestRequest('/endpoint', geometry, 'esriGeometryPolygon', layerDefs)
      expect(response).toEqual('THIS LINE SHOULD NOT BE REACHED')
    } catch (error) {
      expect(error).toEqual(new Error('unexpected ERROR'))
    }
  })
})
