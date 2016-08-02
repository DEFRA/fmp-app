var Joi = require('joi')

var serverSchema = Joi.object().required().keys({
  host: Joi.string().hostname(),
  port: Joi.number().required(),
  labels: Joi.string()
})

var ordnanceSurveySchema = Joi.object().required().keys({
  key: Joi.string().required(),
  urlNamesApi: Joi.string().uri().required(),
  urlGetCapabilities: Joi.string().uri().required()
})

module.exports = {
  server: serverSchema,
  logging: Joi.object(),
  views: Joi.object().required().keys({
    isCached: Joi.boolean().required()
  }),
  httpTimeoutMs: Joi.number().required().min(0).max(30000),
  ordnanceSurvey: ordnanceSurveySchema
}
