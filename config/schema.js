const Joi = require('joi')

const serverSchema = Joi.object().required().keys({
  host: Joi.string().hostname(),
  port: Joi.number().required(),
  labels: Joi.string()
})

module.exports = {
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
  ordnanceSurvey: Joi.object().required().keys({
    namesUrl: Joi.string().uri().required(),
    mapsUrl: Joi.string().uri().required()
  }),
  errbit: Joi.object().required().keys({
    postErrors: Joi.boolean().required(),
    env: Joi.string().required(),
    key: Joi.string().required(),
    host: Joi.string().required(),
    proxy: Joi.string().allow('')
  }),
  siteUrl: Joi.string().uri().required(),
  notifyApiKey: Joi.string().required(),
  notifyApiKeyDevTest: Joi.string().required(),
  notifyEmailTemplateId: Joi.string().required(),
  httpLogTrigger: Joi.string().required(),
  LogAuditTrial: Joi.boolean().required(),
  functionAppUrl: Joi.string().required()
}
