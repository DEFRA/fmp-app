require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const sinon = require('sinon')
const proxyquire = require('proxyquire')

lab.experiment('agol.js', () => {
  let agol
  let stubQueryFeatures
  let stubFromCredentials
  let stubRefreshToken
  let stubTokenGetter

  lab.before(async () => {
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

    const { getEsriToken } = proxyquire('../../server/services/agol/getEsriToken', {
      '@esri/arcgis-rest-request': { ApplicationCredentialsManager: { fromCredentials: stubFromCredentials } }
    })

    agol = proxyquire('../../server/services/agol', {
      './getEsriToken': { getEsriToken },
      '@esri/arcgis-rest-feature-service': { queryFeatures: stubQueryFeatures }
    })
  })

  lab.after(async () => {
    sinon.restore()
  })

  lab.test('esriRequest should call fromCredentials and refreshToken once when 2 esriRequest are made', async () => {
    await agol.esriRequest('/endPoint1')
    Code.expect(stubFromCredentials.calledOnce).to.be.true() // Expect One Call and no further calls
    Code.expect(stubQueryFeatures.callCount).to.equal(1)
    Code.expect(stubRefreshToken.callCount).to.equal(0) // Should use the initial token getter
    Code.expect(stubTokenGetter.callCount).to.equal(2) // Once to test the value and once to return the value

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
    Code.expect(stubQueryFeatures.getCall(0).args[0]).to.equal(expectedParameters)

    await agol.esriRequest('/endPoint2')
    Code.expect(stubFromCredentials.calledOnce).to.be.true() // Should not have been called again
    Code.expect(stubQueryFeatures.callCount).to.equal(2) // Should have been be called again
    Code.expect(stubRefreshToken.callCount).to.equal(1) // Should not be called again

    // Test that the modified expected params get passed to queryFeatures
    Object.assign(expectedParameters, {
      url: 'https://services1.arcgis.com/DUMMY_SERVICE_ID/arcgis/rest/services/endPoint2',
      authentication: 'dummy_token_refreshed'
    })

    Code.expect(stubQueryFeatures.getCall(1).args[0]).to.equal(expectedParameters)
  })
})
