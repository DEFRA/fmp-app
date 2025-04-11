const { toBool } = require('../toBool')

describe('Ensure config is correct', () => {
  beforeEach(() => {
    jest.resetModules()
  })
  it('test config', () => {
    expect(() => {
      require('../index')
    }).not.toThrow()
  })

  it('test config values', () => {
    const { config } = require('../index')
    delete process.env.agolRofrsDepthOrExtents
    const expectedConfig = {
      env: 'local',
      appType: 'internal',
      server: { port: '8050' },
      views: { isCached: false },
      allowProduct1: true, // This covers when the value is NOT in the config, defaults true
      analyticsAccount: 'replace_this',
      googleVerification: 'replace_this',
      fbAppId: 'replace_this',
      httpTimeoutMs: '3000',
      logLevel: 'error',
      ordnanceSurvey: {
        osGetCapabilitiesUrl: 'http://dummyuri',
        osMapsUrl: 'http://dummyuri',
        osNamesUrl: 'http://dummyuri',
        osSearchKey: 'replace_this',
        osClientId: 'replace_this',
        osClientSecret: 'replace_this'
      },
      siteUrl: 'http://dummyuri',
      functionAppUrl: 'http://dummyuri',
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
        floodZonesRiversAndSeaEndPoint: '/Flood_Zones_2_and_3_Rivers_and_Sea_NON_PRODUCTION/FeatureServer/0',
        riversAndSeaDefendedEndPoint: '/Rivers_and_Sea_Defended_Depth_NON_PRODUCTION/FeatureServer',
        riversAndSeaUndefendedEndPoint: '/Rivers_and_Sea_Undefended_Depth_NON_PRODUCTION/FeatureServer',
        riversAndSeaDefendedCCP1EndPoint: '/Rivers_and_Sea_Defended_Depth_CCP1_NON_PRODUCTION/FeatureServer',
        riversAndSeaUndefendedCCP1EndPoint: '/Rivers_and_Sea_Undefended_Depth_CCP1_NON_PRODUCTION/FeatureServer',
        surfaceWaterEndPoint: '/Risk_of_Flooding_from_Surface_Water_Depth_0mm_NON_PRODUCTION/FeatureServer/0',
        agolRofrsDepthOrExtents: 'Depth'
      },
      eamaps: {
        serviceUrl: 'http://dummyEAMapslUrl',
        product1User: 'PRODUCT1_USER',
        product1Password: 'PRODUCT1_PASSWORD',
        product1EndPoint: '/rest/services/FMfP/FMFPGetProduct1-DevTest/GPServer/fmfp_get_product1/execute',
        tokenEndPoint: '/tokens/generateToken'
      },
      defraMap: {
        layerNameSuffix: '_NON_PRODUCTION',
        featureLayerNameSuffix: '_NON_PRODUCTION'
      },
      riskAdminApi: {
        url: 'http://riskadmin-api-url'
      }
    }
    expect(config).toStrictEqual(expectedConfig)
  })

  it('test config values in production', () => {
    jest.resetModules()
    process.env.ENV = 'prod'
    process.env.agolRofrsDepthOrExtents = 'Extents'
    process.env.allowProduct1 = 'false'
    const { config } = require('../index')
    const expectedConfig = {
      env: 'prod',
      appType: 'internal',
      server: { port: '8050' },
      views: { isCached: false },
      allowProduct1: false, // This covers when the value is in the config and set to 'false'
      analyticsAccount: 'replace_this',
      googleVerification: 'replace_this',
      fbAppId: 'replace_this',
      httpTimeoutMs: '3000',
      logLevel: 'error',
      ordnanceSurvey: {
        osGetCapabilitiesUrl: 'http://dummyuri',
        osMapsUrl: 'http://dummyuri',
        osNamesUrl: 'http://dummyuri',
        osSearchKey: 'replace_this',
        osClientId: 'replace_this',
        osClientSecret: 'replace_this'
      },
      siteUrl: 'http://dummyuri',
      functionAppUrl: 'http://dummyuri',
      placeApi: { url: 'http://dummyuri' },
      agol: {
        clientId: 'TEST_AGOL_CLIENT_ID',
        clientSecret: 'TEST_AGOL_CLIENT_SECRET',
        serviceId: 'DUMMY_SERVICE_ID',
        serviceUrl: 'https://services1.arcgis.com/DUMMY_SERVICE_ID/arcgis/rest/services',
        vectorTileUrl: 'https://tiles.arcgis.com/tiles/DUMMY_SERVICE_ID/arcgis/rest/services',
        customerTeamEndPoint: '/Flood_Map_for_Planning_Query_Service/FeatureServer/0',
        localAuthorityEndPoint: '/Flood_Map_for_Planning_Query_Service/FeatureServer/1',
        isEnglandEndPoint: '/Flood_Map_for_Planning_Query_Service/FeatureServer/2',
        floodZonesRiversAndSeaEndPoint: '/Flood_Zones_2_and_3_Rivers_and_Sea/FeatureServer/0',
        riversAndSeaDefendedEndPoint: '/Rivers_and_Sea_Defended_Extents/FeatureServer',
        riversAndSeaUndefendedEndPoint: '/Rivers_and_Sea_Undefended_Extents/FeatureServer',
        riversAndSeaDefendedCCP1EndPoint: '/Rivers_and_Sea_Defended_Extents_CCP1/FeatureServer',
        riversAndSeaUndefendedCCP1EndPoint: '/Rivers_and_Sea_Undefended_Extents_CCP1/FeatureServer',
        surfaceWaterEndPoint: '/Risk_of_Flooding_from_Surface_Water_Depth_0_mm/FeatureServer/0',
        agolRofrsDepthOrExtents: 'Extents'
      },
      eamaps: {
        serviceUrl: 'http://dummyEAMapslUrl',
        product1User: 'PRODUCT1_USER',
        product1Password: 'PRODUCT1_PASSWORD',
        product1EndPoint: '/rest/services/FMfP/FMFPGetProduct1/GPServer/fmfp_get_product1/execute',
        tokenEndPoint: '/tokens/generateToken'
      },
      defraMap: {
        layerNameSuffix: '_Tile_Layer',
        featureLayerNameSuffix: ''
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
