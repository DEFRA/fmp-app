const { validateSchema } = require('./schema')
const { toBool } = require('./toBool')
require('./environment')

const config = {
  env: process.env.ENV,
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
  ignoreUseAutomatedService: toBool(process.env.ignoreUseAutomatedService),
  placeApi: {
    url: process.env.placeApiUrl
  },
  agol: {
    clientId: process.env.agolClientId,
    clientSecret: process.env.agolClientSecret,
    serviceId: process.env.agolServiceId,
    serviceUrl: `https://services1.arcgis.com/${process.env.agolServiceId}/arcgis/rest/services`,
    vectorTileUrl: `https://tiles.arcgis.com/tiles/${process.env.agolServiceId}/arcgis/rest/services`,
    customerTeamEndPoint: process.env.agolCustomerTeamEndPoint,
    localAuthorityEndPoint: process.env.agolLocalAuthorityEndPoint,
    isEnglandEndPoint: process.env.agolIsEnglandEndPoint,
    floodZonesRiversAndSeaEndPoint: process.env.agolFloodZonesRiversAndSeaEndPoint,
    riversAndSeaDefendedEndPoint: process.env.agolRiversAndSeaDefendedEndPoint,
    riversAndSeaUndefendedEndPoint: process.env.agolRiversAndSeaUndefendedEndPoint,
    riversAndSeaDefendedCCP1EndPoint: process.env.agolRiversAndSeaDefendedCCP1EndPoint,
    riversAndSeaUndefendedCCP1EndPoint: process.env.agolRiversAndSeaUndefendedCCP1EndPoint,
    surfaceWaterEndPoint: process.env.agolSurfaceWaterEndPoint
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
