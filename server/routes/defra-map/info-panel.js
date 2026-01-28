const Joi = require('joi')
/*
  tf: Timeframe - [pd:Present day, cc:Climate change]
  ds: dataset - [fz,sw,rs],
  fz: Flood zone - [FZ2,FZ3,FZNODATA,FZCC or none]
  fs:, Flood source - [River,Sea, River and sea or none],
  aep: [low,medium,high or none],
  depth: [any depthband or none],
*/
const climateChange = 'Climate change'
const presentDay = 'Present day'

const getTimeFrame = (params) => {
  return params.tf === 'cc' ? climateChange : presentDay
}

const floodZoneValues = {
  FZ2: '2',
  FZ3: '3'
}

const floodZoneGAValues = {
  FZ2: '2',
  FZ3: '3',
  FZCC: 'cc',
  FZNODATA: 'nodata'
}

const getGaId = (params) => {
  if (params.ds === 'fz') {
    const floodSourceSuffix = params.fs ? `-${params.fs}` : ''
    return `info-fz${params.fz.replace('FZ', '')}${floodSourceSuffix}`.toLowerCase().replaceAll(' ', '-')
    // if (params.fz === 'FZNODATA') {
    //   return 'info-fznodata'
    // } else {
    //   const floodSourceSuffix = params.fs ? `-${params.fs}` : ''
    //   return `info-fz${params.fz}${floodSourceSuffix}`.toLowerCase().replaceAll(' ', '-')
    // }
  }
  return `info-sw-${params.aep}`
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
      const depth = params.ds === 'sw'
      const floodZone = floodZoneValues[params.fz]
      return h.view('info-panel', { ...params, gaId, timeFrame, depth, floodZone })
    },
    validate: {
      query: Joi.object({
        tf: Joi.string().valid('pd', 'cc').required(),
        ds: Joi.string().valid('fz', 'sw', 'rs'),
        fz: Joi.string().valid('FZ2', 'FZ3', 'FZNODATA', 'FZCC'),
        fs: Joi.string().valid('River', 'Sea', 'River and sea').allow(''),
        aep: Joi.string().valid('low', 'medium', 'high')
      })
    }
  }
}
