var Joi = require('joi')

var serverSchema = Joi.object().required().keys({
  host: Joi.string().hostname(),
  port: Joi.number().required(),
  labels: Joi.string()
})

var envVarsSchema = Joi.object().required().keys({
  os_names_key: Joi.string().required(),
  os_names_url: Joi.string().required(),
  os_maps_url: Joi.string().required(),
  gs_proxy_protocol: Joi.string().required(),
  gs_proxy_host: Joi.string().required(),
  gs_proxy_port: Joi.string().required(),
  fmp_service: Joi.string().required(),
  fmp_app_errbit_host: Joi.string().required(),
  fmp_app_errbit_key: Joi.string().required()
})

module.exports = {
  server: serverSchema,
  logging: Joi.object(),
  views: Joi.object().required().keys({
    isCached: Joi.boolean().required()
  }),
  httpTimeoutMs: Joi.number().required().min(0).max(30000),
  postErrors: Joi.boolean().required(),
  envVars: envVarsSchema
}
