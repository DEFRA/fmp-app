var Joi = require('joi')

var serverSchema = Joi.object().required().keys({
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
  httpTimeoutMs: Joi.number().required().min(0).max(30000),
  ordnanceSurvey: Joi.object().required().keys({
    namesUrl: Joi.string().uri().required(),
    mapsUrl: Joi.string().uri().required()
  }),
  errbit: Joi.object().required().keys({
    env: Joi.string().required(),
    key: Joi.string().required(),
    host: Joi.string().required()
  })
}
