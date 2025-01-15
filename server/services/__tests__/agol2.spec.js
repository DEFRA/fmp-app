require('dotenv').config({ path: 'config/.env-example' })


// jest.mock('@esri/arcgis-rest-request')
jest.mock('@esri/arcgis-rest-feature-service')

const arcGisRestRequest = require('@esri/arcgis-rest-request')
const arcGisRestFeatureService = require('@esri/arcgis-rest-feature-service')

const stubFromCredentials = jest.fn()
// const stubQueryFeatures = jest.fn(async () => {
//   console.log('in stub query features')
//   return { features: {} }
// })

const stubRefreshToken = jest.fn()
stubRefreshToken.mockImplementation(() => {
  return 'dummy_token_refreshed'
})
const stubTokenGetter = jest.fn()
stubTokenGetter.mock.results = [{
  type: 'return',
  value: 'dummy_token_initial'
}, {
  type: 'return',
  value: 'dummy_token_initial'
}, {
  type: 'return',
  value: 'undefined'
}]

stubFromCredentials.mockImplementation(() => {
  console.log('in stubfromcredentials mock')
  return {
    token: {
      get: stubTokenGetter
    },
    refreshToken: stubRefreshToken
  }
})

// arcGisRestRequest.ApplicationCredentialsManager.prototype.get = jest.fn().mockImplementation(() => {
//   console.log('in arcGIS reqeust mock')
//   return { fromCredentials: stubFromCredentials }
// })

// arcGisRestRequest.ApplicationCredentialsManager.fromCredentials = jest.fn().mockImplementation(() => {
//   console.log('in FROMCREDENTIALS MOCK')
//   return stubFromCredentials
// })

// was working
arcGisRestRequest.ApplicationCredentialsManager.fromCredentials = () => {
  console.log('INSIDE FROMCREDENTIALS MOCK')
  return {
    token: {
      get: stubTokenGetter
    },
    refreshToken: stubRefreshToken
  }
}

// arcGisRestRequest.ApplicationCredentialsManager.fromCredentials = jest.fn().mockImplementation(() => {
//   console.log('INSIDE FROMCREDENTIALS MOCK')
//   return {
//     token: {
//       get: stubTokenGetter
//     },
//     refreshToken: stubRefreshToken
//   }
// })

arcGisRestFeatureService.queryFeatures = jest.fn(async () => {
  console.log('in stub query features')
  return { features: {} }
})

describe('agol.js', () => {
  // let agol
  // let stubQueryFeatures
  // let stubFromCredentials
  // let stubRefreshToken
  // let stubTokenGetter

  beforeAll(async () => {
    // stubFromCredentials = sinon.stub()
    // const appCredentialsManagerValue = {
    //   token: undefined,
    //   refreshToken: stubRefreshToken
    // }

    // sinon.stub(appCredentialsManagerValue, 'token').get(stubTokenGetter)

    // stubFromCredentials.returns(appCredentialsManagerValue)

    // stubFromCredentials.onCall(1).returns({
    //   token: 'dummy_token_2'
    // })

    // const { getEsriToken } = proxyquire('../agol/getEsriToken', {
    //   '@esri/arcgis-rest-request': { ApplicationCredentialsManager: { fromCredentials: stubFromCredentials } }
    // })

    // agol = proxyquire('../agol', {
    //   './getEsriToken': { getEsriToken },
    //   '@esri/arcgis-rest-feature-service': { queryFeatures: stubQueryFeatures }
    // })
  })

  // afterAll(async () => {
  //   sinon.restore()
  // })

  it('esriRequest should call fromCredentials and refreshToken once when 2 esriRequest are made', async () => {
    const agol = require('../agol')
    await agol.esriRequest('/endPoint1')
    // expect(arcGisRestRequest.ApplicationCredentialsManager.fromCredentials).toHaveBeenCalledTimes(1) // Expect One Call and no further calls
    expect(stubQueryFeatures).toHaveBeenCalledTimes(1)
    expect(stubRefreshToken).toHaveBeenCalledTimes(0) // Should use the initial token getter
    expect(stubTokenGetter).toHaveBeenCalledTimes(2) // Once to test the value and once to return the value

    // Test that the expected params get passed to queryFeatures
    const expectedParameters = {
      url: 'https://services1.arcgis.com/DUMMY_SERVICE_ID/arcgis/rest/services/endPoint1',
      geometry: undefined,
      geometryType: undefined,
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry: 'false',
      authentication: 'dummy_token_initial',
      outFields: '*'
    }
    expect(stubQueryFeatures.getCall(0).args[0]).toEqual(expectedParameters)

    await agol.esriRequest('/endPoint2')
    expect(stubFromCredentials.calledOnce).toBeTruthy() // Should not have been called again
    expect(stubQueryFeatures.callCount).toEqual(2) // Should have been be called again
    expect(stubRefreshToken.callCount).toEqual(1) // Should not be called again

    // Test that the modified expected params get passed to queryFeatures
    Object.assign(expectedParameters, {
      url: 'https://services1.arcgis.com/DUMMY_SERVICE_ID/arcgis/rest/services/endPoint2',
      authentication: 'dummy_token_refreshed'
    })

    expect(stubQueryFeatures.getCall(1).args[0]).toEqual(expectedParameters)
  })
})
