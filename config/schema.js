const Joi = require('joi')
const defaultport = 3000
const serverSchema = Joi.object()
  .required()
  .keys({
    port: Joi.number().required().default(defaultport)
  })

const schema = Joi.object({
  env: Joi.string().required(),
  server: serverSchema,
  service: Joi.string().uri().required(),
  geoserver: Joi.string().uri().required(),
  logging: Joi.object(),
  views: Joi.object().required().keys({
    isCached: Joi.boolean().strict().required()
  }),
  analyticsAccount: Joi.string().required().allow(''),
  googleVerification: Joi.string().required().allow(''),
  fbAppId: Joi.string().required().allow(''),
  httpTimeoutMs: Joi.number().required().min(0).max(30000),
  ordnanceSurvey: Joi.object()
    .required()
    .keys({
      osGetCapabilitiesUrl: Joi.string().required().allow(''),
      osMapsUrl: Joi.string().uri().required(),
      osNamesUrl: Joi.string().uri().required(),
      osSearchKey: Joi.string().required().allow(''),
      osMapsKey: Joi.string().required().allow('')
    }),
  siteUrl: Joi.string().uri().required(),
  functionAppUrl: Joi.string().required(),
  ignoreUseAutomatedService: Joi.boolean().strict(),
  placeApi: Joi.object().required().keys({
    url: Joi.string().uri().required()
  }),
  agol: {
    clientId: Joi.string().required(),
    clientSecret: Joi.string().required(),
    serviceUrl: Joi.string().uri().required(),
    customerTeamEndPoint: Joi.string().required(),
    localAuthorityEndPoint: Joi.string().required(),
    isEnglandEndPoint: Joi.string().required(),
    floodZonesRiversAndSeaEndPoint: Joi.string().required()
  },
  eamaps: {
    serviceUrl: Joi.string().uri().required(),
    product1User: Joi.string().required(),
    product1Password: Joi.string().required(),
    product1EndPoint: Joi.string().required(),
    tokenEndPoint: Joi.string().required()
  }
})

const validateSchema = (config) => {
  const { value, error } = schema.validate(config, { abortEarly: false })

  if (error) {
    throw new Error(`The server config is invalid. ${error.message}`)
  }
  return value
}

module.exports = { validateSchema }
