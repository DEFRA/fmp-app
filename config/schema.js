const Joi = require('joi')
const defaultport = 3000
const serverSchema = Joi.object()
  .required()
  .keys({
    port: Joi.number().required().default(defaultport),
    labels: Joi.string()
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
  mockAddressService: Joi.boolean().strict().required(),
  maintainence: Joi.boolean().strict().required(),
  ordnanceSurvey: Joi.object()
    .required()
    .keys({
      osGetCapabilitiesUrl: Joi.string().required().allow(''),
      osMapsUrl: Joi.string().uri().required(),
      osNamesUrl: Joi.string().uri().required(),
      osSearchKey: Joi.string().required().allow(''),
      osMapsKey: Joi.string().required().allow('')
    }),
  errbit: Joi.object()
    .required()
    .keys({
      postErrors: Joi.boolean().strict().required(),
      options: {
        env: Joi.string().required(),
        key: Joi.string().required(),
        host: Joi.string().required(),
        proxy: Joi.string().allow('')
      }
    }),
  siteUrl: Joi.string().uri().required(),
  LogAuditTrial: Joi.boolean().strict().required(),
  functionAppUrl: Joi.string().required(),
  ignoreUseAutomatedService: Joi.boolean().strict(),
  placeApi: Joi.object().required().keys({
    url: Joi.string().uri().required()
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
