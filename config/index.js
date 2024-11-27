const { validateSchema } = require('./schema')
const { toBool } = require('./toBool')
require('dotenv').config()

const config = {
  env: process.env.ENV,
  server: {
    port: process.env.PORT
  },
  service: process.env.service,
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
    serviceUrl: process.env.agolServiceUrl,
    customerTeamEndPoint: process.env.agolCustomerTeamEndPoint,
    localAuthorityEndPoint: process.env.agolLocalAuthorityEndPoint,
    isEnglandEndPoint: process.env.agolIsEnglandEndPoint,
    floodZonesRiversAndSeaEndPoint: process.env.agolFloodZonesRiversAndSeaEndPoint
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
  }
}

validateSchema(config)

module.exports = { config }
