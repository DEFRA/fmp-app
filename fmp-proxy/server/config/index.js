require('./environment')
const Joi = require('joi')

const schema = Joi.object({
  port: Joi.number().integer().min(1).max(65535).default(3005),
  agol: Joi.object({
    clientId: Joi.string().min(3).required(),
    clientSecret: Joi.string().min(3).required(),
    serviceId: Joi.string().min(3).required(),
    serviceUrl: Joi.string().uri().required(),
    vectorTileUrl: Joi.string().uri().required(),
    tokenDurationInMinutes: Joi.number().integer().min(1).default(7200)
  }).required(),
  ordnanceSurvey: Joi.object({
    osGetCapabilitiesUrl: Joi.string().required().allow(''),
    osMapsUrl: Joi.string().uri().required(),
    osNamesUrl: Joi.string().uri().required(),
    osSearchKey: Joi.string().required().allow(''),
    osClientId: Joi.string().min(3).required(),
    osClientSecret: Joi.string().min(3).required(),
    tokenUrl: Joi.string().uri().default('https://api.os.uk/oauth2/token/v1')
  }).required()
})

const buildConfig = (env = process.env) => {
  const agolServiceId = env.agolServiceId

  return {
    port: env.FMPPROXYPORT,
    agol: {
      clientId: env.agolClientId,
      clientSecret: env.agolClientSecret,
      serviceId: agolServiceId,
      serviceUrl: `https://services1.arcgis.com/${agolServiceId}/arcgis/rest/services`,
      vectorTileUrl: `https://tiles.arcgis.com/tiles/${agolServiceId}/arcgis/rest/services`,
      tokenDurationInMinutes: env.ESRI_TOKEN_DURATION_MINUTES
    },
    ordnanceSurvey: {
      osGetCapabilitiesUrl: env.ordnanceSurveyOsGetCapabilitiesUrl,
      osMapsUrl: env.ordnanceSurveyOsMapsUrl,
      osNamesUrl: env.ordnanceSurveyOsNamesUrl,
      osSearchKey: env.ordnanceSurveyOsSearchKey,
      osClientId: env.ordnanceSurveyOsClientId,
      osClientSecret: env.ordnanceSurveyOsClientSecret,
      tokenUrl: env.OS_TOKEN_URL
    }
  }
}

const validateConfig = (configToValidate) => {
  const { error } = schema.validate(configToValidate, {
    abortEarly: false,
    convert: true
  })

  if (error) {
    throw new Error(`Proxy environment configuration is invalid: ${error.message}`)
  }

  return configToValidate
}

const config = validateConfig(buildConfig())

module.exports = { config, buildConfig, validateConfig }
