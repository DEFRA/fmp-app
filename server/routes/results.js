const { config } = require('../../config')
const {
  getAreaInHectares,
  getCentreOfPolygon
} = require('../services/shape-utils')

module.exports = [
  {
    method: 'GET',
    path: '/results',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon } = request.query
        const contactData = await request.server.methods.getPsoContactsByPolygon(polygon)
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        const floodData = await request.server.methods.getFloodDataByPolygon(polygon)
        floodData.areaInHectares = getAreaInHectares(polygon)
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        floodData.isFZ1Andlt1ha = floodData.floodZone === '1' && floodData.areaInHectares < 1
        floodData.isFZ1Andgt1ha = floodData.floodZone === '1' && floodData.areaInHectares >= 1
        floodData.hasROFRSRiskBand =
          floodData.riversAndSeaDefended.riskBandPercent ||
          floodData.riversAndSeaUndefended.riskBandPercent ||
          floodData.riversAndSeaDefendedCC.riskBandPercent ||
          floodData.riversAndSeaUndefendedCC.riskBandPercent
        console.log('results page data:\n', { polygon, floodData, contactData, showOrderProduct4Button })
        return h.view('results', { polygon, floodData, contactData, showOrderProduct4Button })
      }
    }
  }
]
