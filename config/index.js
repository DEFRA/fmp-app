const { validateSchema } = require('./schema')
const { toBool } = require('./toBool')
require('./environment')

const agolEndpoints = {
  customerTeamEndPoint: '/Flood_Map_for_Planning_Query_Service_NON_PRODUCTION/FeatureServer/0',
  localAuthorityEndPoint: '/Flood_Map_for_Planning_Query_Service_NON_PRODUCTION/FeatureServer/1',
  isEnglandEndPoint: '/Flood_Map_for_Planning_Query_Service_NON_PRODUCTION/FeatureServer/2',
  floodZonesRiversAndSeaEndPoint: '/Flood_Zones_2_and_3_Rivers_and_Sea_NON_PRODUCTION/FeatureServer/0',

  riversAndSeaDefendedEndPoint: '/Rivers_and_Sea_Defended_Extents_NON_PRODUCTION/FeatureServer',
  riversAndSeaUndefendedEndPoint: '/Rivers_and_Sea_Undefended_Extents_NON_PRODUCTION/FeatureServer',
  riversAndSeaDefendedCCP1EndPoint: '/Rivers_and_Sea_Defended_Extents_CCP1_NON_PRODUCTION/FeatureServer',
  riversAndSeaUndefendedCCP1EndPoint: '/Rivers_and_Sea_Undefended_Extents_CCP1_NON_PRODUCTION/FeatureServer',

  surfaceWaterEndPoint: '/Risk_of_Flooding_from_Surface_Water_Depth_0mm_NON_PRODUCTION/FeatureServer/0'
}

const isProduction = () => {
  return process.env.ENV === 'prd' ||
    process.env.ENV === 'production' ||
    process.env.ENV === 'prod' ||
    process.env.ENV === 'prod-green' ||
    process.env.ENV === 'prod-blue'
}

const productioniseEndpoint = (endpoint) => {
  return isProduction() ? endpoint.replace('_NON_PRODUCTION', '') : endpoint
}

const config = {
  env: process.env.ENV,
  appType: process.env.fmpAppType,
  server: {
    port: process.env.PORT
  },
  geoserver: process.env.geoserver,
  views: {
    isCached: toBool(process.env.viewsIsCached)
  },
  analyticsAccount: process.env.analyticsAccount,
  googleVerification: process.env.googleVerification,
  fbAppId: process.env.fbAppId,
  httpTimeoutMs: process.env.httpTimeoutMs,
  ordnanceSurvey: {
    osGetCapabilitiesUrl: process.env.ordnanceSurveyOsGetCapabilitiesUrl,
    osMapsUrl: process.env.ordnanceSurveyOsMapsUrl,
    osNamesUrl: process.env.ordnanceSurveyOsNamesUrl,
    osSearchKey: process.env.ordnanceSurveyOsSearchKey,
    osMapsKey: process.env.ordnanceSurveyOsMapsKey,
    osClientId: process.env.ordnanceSurveyOsClientId,
    osClientSecret: process.env.ordnanceSurveyOsClientSecret
  },
  siteUrl: process.env.siteUrl,
  functionAppUrl: process.env.functionAppUrl,
  placeApi: {
    url: process.env.placeApiUrl
  },
  agol: {
    clientId: process.env.agolClientId,
    clientSecret: process.env.agolClientSecret,
    serviceId: process.env.agolServiceId,
    serviceUrl: `https://services1.arcgis.com/${process.env.agolServiceId}/arcgis/rest/services`,
    vectorTileUrl: `https://tiles.arcgis.com/tiles/${process.env.agolServiceId}/arcgis/rest/services`,
    customerTeamEndPoint: productioniseEndpoint(agolEndpoints.customerTeamEndPoint),
    localAuthorityEndPoint: productioniseEndpoint(agolEndpoints.localAuthorityEndPoint),
    isEnglandEndPoint: productioniseEndpoint(agolEndpoints.isEnglandEndPoint),
    floodZonesRiversAndSeaEndPoint: productioniseEndpoint(agolEndpoints.floodZonesRiversAndSeaEndPoint),
    riversAndSeaDefendedEndPoint: productioniseEndpoint(agolEndpoints.riversAndSeaDefendedEndPoint),
    riversAndSeaUndefendedEndPoint: productioniseEndpoint(agolEndpoints.riversAndSeaUndefendedEndPoint),
    riversAndSeaDefendedCCP1EndPoint: productioniseEndpoint(agolEndpoints.riversAndSeaDefendedCCP1EndPoint),
    riversAndSeaUndefendedCCP1EndPoint: productioniseEndpoint(agolEndpoints.riversAndSeaUndefendedCCP1EndPoint),
    surfaceWaterEndPoint: productioniseEndpoint(agolEndpoints.surfaceWaterEndPoint)
  },
  eamaps: {
    serviceUrl: process.env.eamapsServiceUrl,
    product1User: process.env.eamapsProduct1User,
    product1Password: process.env.eamapsProduct1Password,
    product1EndPoint: '/rest/services/FMfP/FMFPGetProduct1/GPServer/fmfp_get_product1/execute',
    tokenEndPoint: '/tokens/generateToken'
  },
  defraMap: {
    layerNameSuffix: process.env.layerNameSuffix || ''
  },
  riskAdminApi: {
    url: process.env.riskAdminApiUrl
  }
}

validateSchema(config)

module.exports = { config }
