const { validateSchema } = require('./schema')
require('dotenv').config()

const toBool = (val) =>
  (val === true || val === 'true')
    ? true
    : (val === false || val === 'false')
        ? false
        : undefined

const config = {
  env: process.env.ENV,
  server: {
    port: process.env.PORT,
    labels: process.env.LABELS
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
  maintainence: toBool(process.env.maintainence),
  ordnanceSurvey: {
    osGetCapabilitiesUrl: process.env.ordnanceSurveyOsGetCapabilitiesUrl,
    osMapsUrl: process.env.ordnanceSurveyOsMapsUrl,
    osNamesUrl: process.env.ordnanceSurveyOsNamesUrl,
    osSearchKey: process.env.ordnanceSurveyOsSearchKey,
    osMapsKey: process.env.ordnanceSurveyOsMapsKey
  },
  errbit: {
    postErrors: toBool(process.env.ERRBIT_POST_ERRORS),
    options: {
      env: process.env.ENV,
      key: process.env.ERRBIT_KEY,
      host: process.env.ERRBIT_HOST
    }
  },
  siteUrl: process.env.siteUrl,
  LogAuditTrial: toBool(process.env.LogAuditTrial),
  functionAppUrl: process.env.functionAppUrl,
  ignoreUseAutomatedService: toBool(process.env.ignoreUseAutomatedService),
  placeApi: {
    url: process.env.placeApiUrl
  }
}

validateSchema(config)

module.exports = { config }
