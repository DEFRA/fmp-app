const Joi = require('joi')
/*
  x: eastings
  y: northings,
  tf: Timeframe - [pd:Present day, cc:Climate change]
  ds: dataset - [fz,sw,rs],
  fz: Flood zone - [2,3,nd,cc or none]
  fs:, Flood source - [River,Sea, River and sea or none],
  aep: [low,medium,high or none],
  depth: [any depthband or none],
*/
module.exports = {
  method: 'GET',
  path: '/defra-map/info-panel',
  options: {
    description: 'info panel markup for map page',
    handler: async (request, h) => {
      const params = request.query
      const gaId = `info-fz${params.fz}-${params.fs}`.toLowerCase().replaceAll(' ', '-')
      const timeFrame = params.tf === 'cc' ? 'Climate change' : 'Present day'
      return h.view('info-panel', { ...params, gaId, timeFrame })
    },
    validate: {
      query: Joi.object({
        x: Joi.number(),
        y: Joi.number(),
        tf: Joi.string().valid('pd', 'cc'),
        ds: Joi.string().valid('fz', 'sw', 'rs'),
        fz: Joi.string().valid('2', '3', 'nd', 'cc'),
        fs: Joi.string().valid('River', 'Sea', 'River and sea'),
        aep: Joi.string().valid('low', 'medium', 'high'),
        depth: Joi.string()
      })
    }
  }
}
