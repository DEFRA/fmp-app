require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const Code = require('@hapi/code')
const { toBool } = require('../config/toBool')

lab.experiment('Ensure config is correct', () => {
  lab.test('test config', () => {
    Code.expect(() => {
      require('../config')
    }).not.to.throw()
  })

  lab.test('test config values', () => {
    const { config } = require('../config')
    const expectedConfig = {
      env: 'dev',
      server: { port: '8050' },
      service: 'http://dummyuri',
      geoserver: 'http://dummyuri',
      views: { isCached: false },
      analyticsAccount: 'replace_this',
      googleVerification: 'replace_this',
      fbAppId: 'replace_this',
      httpTimeoutMs: '3000',
      ordnanceSurvey: {
        osGetCapabilitiesUrl: 'http://dummyuri',
        osMapsUrl: 'http://dummyuri',
        osNamesUrl: 'http://dummyuri',
        osSearchKey: 'replace_this',
        osMapsKey: 'replace_this',
        osClientId: 'replace_this',
        osClientSecret: 'replace_this'
      },
      siteUrl: 'http://dummyuri',
      functionAppUrl: '=http://dummyuri',
      ignoreUseAutomatedService: true,
      placeApi: { url: 'http://dummyuri' },
      agol: {
        clientId: 'TEST_AGOL_CLIENT_ID',
        clientSecret: 'TEST_AGOL_CLIENT_SECRET',
        serviceUrl: 'http://dummyAgolUrl',
        customerTeamEndPoint: '/Flood_Map_for_Planning_Query_Service_NON_PRODUCTION/FeatureServer/0',
        localAuthorityEndPoint: '/Flood_Map_for_Planning_Query_Service_NON_PRODUCTION/FeatureServer/1',
        isEnglandEndPoint: '/Flood_Map_for_Planning_Query_Service_NON_PRODUCTION/FeatureServer/2',
        floodZonesRiversAndSeaEndPoint: '/Flood_Zones_2_and_3_Rivers_and_Sea_NON_PRODUCTION/FeatureServer/0'
      },
      eamaps: {
        serviceUrl: 'http://dummyEAMapslUrl',
        product1User: 'PRODUCT1_USER',
        product1Password: 'PRODUCT1_PASSWORD',
        product1EndPoint: '/rest/services/FMfP/FMFPGetProduct1/GPServer/fmfp_get_product1/execute',
        tokenEndPoint: '/tokens/generateToken'
      },
      defraMap: {
        layerNameSuffix: '_NON_PRODUCTION'
      }
    }
    Code.expect(config).to.equal(expectedConfig)
  })
})

lab.experiment('toBool function', () => {
  lab.test('toBool(true) should be true', () => Code.expect(toBool(true)).to.equal(true))
  lab.test('toBool("true") should be true', () => Code.expect(toBool('true')).to.equal(true))
  lab.test('toBool(false) should be false', () => Code.expect(toBool(false)).to.equal(false))
  lab.test('toBool("false") should be false', () => Code.expect(toBool('false')).to.equal(false))
  lab.test('toBool(undefined) should be undefined', () => Code.expect(toBool(undefined)).to.equal(undefined))
  lab.test('toBool("other") should be undefined', () => Code.expect(toBool('other')).to.equal(undefined))
})
