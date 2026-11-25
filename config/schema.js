const Joi = require('joi')
const { createPrivateKey } = require('node:crypto')
const defaultport = 3000

const validatePrivateKey = (value, helpers) => {
  try {
    createPrivateKey(Buffer.from(value, 'base64').toString('utf8'))
    return value
  } catch {
    return helpers.message('{{#label}} must be a base64 encoded PEM private key')
  }
}

const serverSchema = Joi.object()
  .required()
  .keys({
    port: Joi.number().required().default(defaultport)
  })

const schema = Joi.object({
  env: Joi.string().required().valid('local', 'development', 'test', 'pre-prod', 'prod'),
  appType: Joi.string().required().valid('internal', 'public'),
  allowedOrigins: Joi.object().required(),
  server: serverSchema,
  logLevel: Joi.string().valid('error', 'warn', 'info', 'debug').default('error'),
  analyticsAccount: Joi.string().required().allow(''),
  fbAppId: Joi.string().required().allow(''),
  ordnanceSurvey: Joi.object()
    .required()
    .keys({
      osNamesUrl: Joi.string().uri().required(),
      osClientId: Joi.string().required().allow(''),
      osClientSecret: Joi.string().required().allow(''),
      osPlacesUrl: Joi.string().uri().required(),
      osPlacesClientId: Joi.string().required().allow(''),
      osPlacesClientSecret: Joi.string().required().allow('')
    }),
  homePageRedirectUrl: Joi.string().uri().allow(null),
  siteUrl: Joi.string().uri().required(),
  functionAppUrl: Joi.string().required(),
  fmpProxyUrl: Joi.string(),
  proxyPrivateKey: Joi.string().required().custom(validatePrivateKey, 'base64 encoded PEM private key'),
  ceEmailReplaceMap: Joi.object().required(),
  agol: {
    clientId: Joi.string().required(),
    clientSecret: Joi.string().required(),
    serviceId: Joi.string().required(),
    serviceUrl: Joi.string().uri().required(),
    vectorTileUrl: Joi.string().uri().required(),
    customerTeamEndPoint: Joi.string().required(),
    localAuthorityEndPoint: Joi.string().required(),
    isEnglandEndPoint: Joi.string().required(),
    floodZonesRiversAndSeaEndPoint: Joi.string().required(),
    floodZonesClimateChangeEndPoint: Joi.string().required(),
    riversAndSeaDefendedEndPoint: Joi.string().required(),
    riversAndSeaUndefendedEndPoint: Joi.string().required(),
    riversAndSeaDefendedCCP1EndPoint: Joi.string().required(),
    riversAndSeaUndefendedCCP1EndPoint: Joi.string().required(),
    surfaceWater1In30EndPoint: Joi.string().required(),
    surfaceWater1In100EndPoint: Joi.string().required(),
    surfaceWater1In1000EndPoint: Joi.string().required(),
    surfaceWaterClimateChange1In30EndPoint: Joi.string().required(),
    surfaceWaterClimateChange1In100EndPoint: Joi.string().required(),
    surfaceWaterClimateChange1In1000EndPoint: Joi.string().required(),
    agolRofrsDepthOrExtents: Joi.string().valid('Depth', 'Extents')
  },
  eamaps: {
    serviceUrl: Joi.string().uri().required(),
    product1User: Joi.string().required(),
    product1Password: Joi.string().required(),
    product1EndPoint: Joi.string().required(),
    tokenEndPoint: Joi.string().required()
  },
  defraMap: {
    layerNameSuffix: Joi.string().required().valid('_NON_PRODUCTION', '_Tile_Layer'),
    featureLayerNameSuffix: Joi.string().required().valid('_NON_PRODUCTION', '')
  },
  riskAdminApi: {
    url: Joi.string().uri().required()
  },
  cookie: Joi.object().required().keys({
    name: Joi.string().required(),
    policy: Joi.object().required().keys({
      clearInvalid: Joi.boolean().required(),
      encoding: Joi.string().required(),
      isSameSite: Joi.string().required(),
      isSecure: Joi.boolean().required()
    }),
    config: Joi.object().required().keys({
      ttl: Joi.number().required()
    })
  })
})

const validateSchema = (config) => {
  const { value, error } = schema.validate(config, { abortEarly: false })

  if (error) {
    throw new Error(`The server config is invalid. ${error.message}`)
  }
  return value
}

module.exports = { validateSchema }
