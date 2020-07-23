const Joi = require('joi')

const serverSchema = Joi.object().required().keys({
  host: Joi.string().hostname(),
  port: Joi.number().required().default(3000),
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
  maintainence: Joi.boolean().required(),
  ordnanceSurvey: Joi.object().required().keys({
    namesUrl: Joi.string().uri().required(),
    mapsUrl: Joi.string().uri().required()
  }),
  errbit: Joi.object().required().keys({
    postErrors: Joi.boolean().required(),
    options: Joi.object().required().keys({
      env: Joi.string(),
      key: Joi.string(),
      host: Joi.string(),
      proxy: Joi.string()
    })
  }),
  siteUrl: Joi.string().uri().required(),
  LogAuditTrial: Joi.boolean().required(),
  functionAppUrl: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required()
}