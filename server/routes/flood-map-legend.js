const Wreck = require('@hapi/wreck')
const config = require('../../config')
const legendResponses = {}

const fetchLegendResponse = async key => {
  if (!legendResponses[key]) {
    const url = `${config.geoserver}/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=application/json&WIDTH=200&HEIGHT=200&LAYER=${key}`
    const { payload } = await Wreck.get(url)
    const { Legend } = JSON.parse(payload.toString())
    const { rules } = Legend[0]
    const filteredRules = rules
      .filter(({ name }) => name !== 'default')
      .map(({ name, symbolizers }) => {
        const { Polygon: { fill } } = symbolizers[0]
        return { name, fill }
      })
    legendResponses[key] = {
      key,
      rules: filteredRules
    }
    //    console.log('rules: ', rules)
  }
  //  console.log('legendResponses', legendResponses)
  return legendResponses[key]
}

module.exports = [{
  method: 'POST',
  path: '/flood-map-legend',
  options: {
    description: 'Gets the dynamic legend values for the Nafra 2 layers',
    handler: async (request, h) => {
      const legendsToFetch = Object.keys(request.payload || {})
      const legends = await Promise.all(legendsToFetch.map(key => fetchLegendResponse(key)))
      console.log('legends', legends)
      Object.values(legends).forEach(({ key, rules }) => {
        console.log('Values for ', key)
        rules.forEach(({ name, fill }) => {
          console.log(name, fill)
        })
      })
      return legends
    },
    auth: false
  }
}]
