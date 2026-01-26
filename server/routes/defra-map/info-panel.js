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

const getTimeFrame = (params) => {
  const climateChange = 'Climate change'
  const presentDay = 'Present day'
  if (params.tf) {
    return params.tf === 'cc' ? climateChange : presentDay
  } else if (params.fz) {
    return params.fz === '2' || params.fz === '3' ? presentDay : climateChange
  } else {
    return presentDay
  }
}

const getGaId = (params) => {
  if (params.ds === 'fz') {
    if (params.fz === 'nd') {
      return 'info-fznodata'
    } else {
      return `info-fz${params.fz}-${params.fs}`.toLowerCase().replaceAll(' ', '-')
    }
  }
}

module.exports = {
  method: 'GET',
  path: '/defra-map/info-panel',
  options: {
    description: 'info panel markup for map page',
    handler: async (request, h) => {
      const params = request.query
      const gaId = getGaId(params)
      const timeFrame = getTimeFrame(params)
      return h.view('info-panel', { ...params, gaId, timeFrame })
    },
    validate: {
      query: Joi.object({
        x: Joi.number(),
        y: Joi.number(),
        tf: Joi.string().valid('pd', 'cc').required(),
        ds: Joi.string().valid('fz', 'sw', 'rs'),
        fz: Joi.string().valid('2', '3', 'nd', 'cc'),
        fs: Joi.string().valid('River', 'Sea', 'River and sea').allow(''),
        aep: Joi.string().valid('low', 'medium', 'high'),
        depth: Joi.string()
      })
    }
  }
}
