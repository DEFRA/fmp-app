require('dotenv').config({ path: 'config/.env-example' })

const sinon = require('sinon')
const proxyquire = require('proxyquire')

describe('agol.js', () => {
  let agol
  let stubQueryFeatures
  let stubFromCredentials
  let stubRefreshToken
  let stubTokenGetter

  beforeAll(async () => {
    stubQueryFeatures = sinon.stub().resolves({ features: {} })
    stubRefreshToken = sinon.stub().returns('dummy_token_refreshed')

    stubTokenGetter = sinon.stub()
    let callCount = 0
    stubTokenGetter.onCall(callCount++).returns('dummy_token_initial')
    stubTokenGetter.onCall(callCount++).returns('dummy_token_initial')
    stubTokenGetter.onCall(callCount++).returns(undefined)
    stubTokenGetter.returns('dummy_token_persisted')

    stubFromCredentials = sinon.stub()
    const appCredentialsManagerValue = {
      token: undefined,
      refreshToken: stubRefreshToken
    }

    sinon.stub(appCredentialsManagerValue, 'token').get(stubTokenGetter)

    stubFromCredentials.returns(appCredentialsManagerValue)

    stubFromCredentials.onCall(1).returns({
      token: 'dummy_token_2'
    })

    const { getEsriToken } = proxyquire('../agol/getEsriToken', {
      '@esri/arcgis-rest-request': { ApplicationCredentialsManager: { fromCredentials: stubFromCredentials } }
    })

    agol = proxyquire('../agol', {
      './getEsriToken': { getEsriToken },
      '@esri/arcgis-rest-feature-service': { queryFeatures: stubQueryFeatures }
    })
  })

  afterAll(async () => {
    sinon.restore()
  })

  it('esriRequest should call fromCredentials and refreshToken once when 2 esriRequest are made', async () => {
    await agol.esriRequest('/endPoint1')
    expect(stubFromCredentials.calledOnce).toBeTruthy() // Expect One Call and no further calls
    expect(stubQueryFeatures.callCount).toEqual(1)
    expect(stubRefreshToken.callCount).toEqual(0) // Should use the initial token getter
    expect(stubTokenGetter.callCount).toEqual(2) // Once to test the value and once to return the value

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
