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
        const [contactData, floodData] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(polygon),
          request.server.methods.getFloodDataByPolygon(polygon)]
        )
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        const showProduct1Button = config.allowProduct1
        floodData.areaInHectares = getAreaInHectares(polygon)
        floodData.centreOfPolygon = getCentreOfPolygon(polygon)
        floodData.isFZ1Andlt1ha = floodData.floodZone === '1' && floodData.areaInHectares < 1
        floodData.isFZ1Andgt1ha = floodData.floodZone === '1' && floodData.areaInHectares >= 1
        const isRiversAndSea =
          floodData.riversAndSeaDefended.riskBandPercent ||
          floodData.riversAndSeaUndefended.riskBandPercent ||
          floodData.riversAndSeaDefendedCC.riskBandPercent ||
          floodData.riversAndSeaUndefendedCC.riskBandPercent
        floodData.hasROFRSRiskBand = isRiversAndSea
        floodData.isFZ1Andlt1haShowFRA = floodData.isFZ1Andlt1ha && isRiversAndSea

        return h.view('results', { polygon, floodData, contactData, showOrderProduct4Button, showProduct1Button })
      }
    }
  }
]
