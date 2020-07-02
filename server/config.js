const joi = require('@hapi/joi')

const defaultPort = 3000

// Define config schema
const schema = joi.object({
  restClientTimeoutMillis: joi.number().default(15000),
  port: joi.number().default(defaultPort),
  env: joi.string().valid('development', 'test', 'production').default('development'),
  serviceUrl: joi.string().uri().default('http://localhost:8050'),
  geoserverUrl: joi.string().uri().default('http://localhost:8080'),
  rainfallApiUrl: joi.string().uri().default('http://localhost:3000'),
  // rainfallApiUrl: joi.string().uri().default('https://environment.data.gov.uk/flood-monitoring'),
  bingKey: joi.string().required(),
  ordnanceSurveyKey: joi.string().optional(),
  browserRefreshUrl: joi.string().optional(),
  httpsProxy: joi.string().uri().default(''),
  httpTimeoutMs: joi.number().default(10000),
  gaAccId: joi.string().default(''),
  fbAppId: joi.string().default(''),
  siteUrl: joi.string().default(`http://localhost:${defaultPort}`),
  errbit: joi.object().required().keys({
    postErrors: joi.boolean().default(false),
    options: joi.object().required().keys({
      env: joi.string(),
      key: joi.string(),
      host: joi.string(),
      proxy: joi.string()
    })
  })
})

// Build config
const config = {
  restClientTimeoutMillis: 10000,
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  serviceUrl: process.env.FLOOD_APP_SERVICE_URL,
  geoserverUrl: process.env.FLOOD_APP_GEOSERVER_URL,
  rainfallApiUrl: process.env.FLOOD_APP_RAINFALL_API_URL,
  bingKey: process.env.FLOOD_APP_BING_KEY || 'TEST',
  httpsProxy: process.env.HTTPS_PROXY,
  httpTimeoutMs: process.env.FLOOD_APP_HTTP_TIMEOUT,
  gaAccId: process.env.FLOOD_APP_GA_ID,
  fbAppId: process.env.FLOOD_APP_FBAPP_ID,
  siteUrl: process.env.FLOOD_APP_SITE_URL,
  errbit: {
    postErrors: process.env.FLOOD_APP_ERRBIT_POST_ERRORS,
    options: {
      env: process.env.FLOOD_APP_ERRBIT_ENV,
      key: process.env.FLOOD_APP_ERRBIT_KEY,
      host: process.env.FLOOD_APP_ERRBIT_HOST,
      proxy: process.env.FLOOD_APP_ERRBIT_PROXY
    }
  }
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the joi validated value
const value = result.value

// Add some helper props
value.isDev = value.env === 'development'
value.isProd = value.env === 'production'

module.exports = value
