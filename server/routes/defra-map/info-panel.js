/*
  coords: [eastings,northings],
  tf: Timeframe - [pd:Present day, cc:Climate change]
  ds: dataset - [fz,sw,rs],
  fz: Flood zone - [FZ2,FZ3,FZNODATA,FZCC or none]
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
      return h.view('info-panel', params)
    },
    tags: ['asset']
  }
}
