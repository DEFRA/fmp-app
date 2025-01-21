const { toBool } = require('../toBool')

describe('Ensure config is correct', () => {
  it('test config', () => {
    expect(() => {
      require('../index')
    }).not.toThrow()
  })

  it('test config values', () => {
    const { config } = require('../index')
    const expectedConfig = {
      env: 'dev',
      appType: 'internal',
      server: { port: '8050' },
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
        serviceId: 'DUMMY_SERVICE_ID',
        serviceUrl: 'https://services1.arcgis.com/DUMMY_SERVICE_ID/arcgis/rest/services',
        vectorTileUrl: 'https://tiles.arcgis.com/tiles/DUMMY_SERVICE_ID/arcgis/rest/services',
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
        agolServiceUrl: 'https://services1.arcgis.com/DUMMY_SERVICE_ID/arcgis/rest/services',
        agolVectorTileUrl: 'https://tiles.arcgis.com/tiles/DUMMY_SERVICE_ID/arcgis/rest/services',
        layerNameSuffix: '_NON_PRODUCTION'
      },
      riskAdminApi: {
        url: 'http://riskadmin-api-url'
      }
    }
    expect(config).toStrictEqual(expectedConfig)
  })
})

describe('toBool function', () => {
  it('toBool(true) should be true', () => expect(toBool(true)).toBe(true))
  it('toBool("true") should be true', () => expect(toBool('true')).toBe(true))
  it('toBool(false) should be false', () => expect(toBool(false)).toBe(false))
  it('toBool("false") should be false', () => expect(toBool('false')).toBe(false))
  it('toBool(undefined) should be undefined', () => expect(toBool(undefined)).toBe(undefined))
  it('toBool("other") should be undefined', () => expect(toBool('other')).toBe(undefined))
})
