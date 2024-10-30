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
    osMapsKey: process.env.ordnanceSurveyOsMapsKey
  },
  siteUrl: process.env.siteUrl,
  functionAppUrl: process.env.functionAppUrl,
  ignoreUseAutomatedService: toBool(process.env.ignoreUseAutomatedService),
  placeApi: {
    url: process.env.placeApiUrl
  },
  agol: {
    clientId: process.env.agolClientId,
    clientSecret: process.env.agolClientSecret
  }
}

validateSchema(config)

module.exports = { config }
