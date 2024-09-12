const Joi = require('joi')
const defaultport = 3000
const serverSchema = Joi.object()
  .required()
  .keys({
    host: Joi.string().hostname(),
    port: Joi.number().required().default(defaultport),
    labels: Joi.string()
  })

module.exports = Joi.object({
  server: serverSchema,
  service: Joi.string().uri().required(),
  geoserver: Joi.string().uri().required(),
  logging: Joi.object(),
  views: Joi.object().required().keys({
    isCached: Joi.boolean().required()
  }),
  analyticsAccount: Joi.string().required().allow(''),
  googleVerification: Joi.string().required().allow(''),
  fbAppId: Joi.string().required().allow(''),
  httpTimeoutMs: Joi.number().required().min(0).max(30000),
  mockAddressService: Joi.boolean().required(),
  maintainence: Joi.boolean().required(),
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
      postErrors: Joi.boolean().required(),
      options: {
        env: Joi.string().required(),
        key: Joi.string().required(),
        host: Joi.string().required(),
        proxy: Joi.string().allow('')
      }
    }),
  siteUrl: Joi.string().uri().required(),
  LogAuditTrial: Joi.boolean().required(),
  functionAppUrl: Joi.string().required(),
  ignoreUseAutomatedService: Joi.boolean(),
  placeApi: Joi.object().required().keys({
    url: Joi.string().uri().required()
  })
})
