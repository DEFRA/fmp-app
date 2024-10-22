const { validateSchema } = require('./schema')

const config = {
  env: process.env.ENV,
  server: {
    host: process.env.HOST,
    port: process.env.PORT,
    labels: process.env.LABELS
  },
  service: process.env.service,
  geoserver: process.env.geoserver,
  views: {
    isCashed: process.env.viewsIsCached
  },
  analyticsAccount: process.env.analyticsAccount,
  googleVerification: process.env.googleVerification,
  fbAppId: process.env.fbAppId,
  httpTimeoutMs: process.env.httpTimeoutMs,
  mockAddressService: process.env.mockAddressService,
  maintainence: process.env.maintainence,
  ordnanceSurvey: {
    osGetCapabilitiesUrl: process.env.ordnanceSurveyOsGetCapabilitiesUrl,
    osMapsUrl: process.env.ordnanceSurveyOsMapsUrl,
    osNamesUrl: process.env.ordnanceSurveyOsNamesUrl,
    osSearchKey: process.env.ordnanceSurveyOsSearchKey,
    osMapsKey: process.env.ordnanceSurveyOsMapsKey
  },
  errbit: {
    postErrors: process.env.ERRBIT_POST_ERRORS,
    env: process.env.NODE_ENV,
    key: process.env.ERRBIT_KEY,
    host: process.env.ERRBIT_HOST
  },
  siteUrl: process.env.siteUrl,
  LogAuditTrial: process.env.LogAuditTrial,
  functionAppUrl: process.env.functionAppUrl,
  ignoreUseAutomatedService: process.env.ignoreUseAutomatedService,
  placeApi: {
    url: process.env.placeApiUrl
  }
}

validateSchema(config)

module.exports = { config }
