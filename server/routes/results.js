const { config } = require('../../config')
const {
  getAreaInHectares,
  getCentreOfPolygon,
  decodePolygon
} = require('../services/shape-utils')

module.exports = [
  {
    method: 'GET',
    path: '/results',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon, encodedPolygon } = request.query
        let decodedPolygon
        if (encodedPolygon) {
          decodedPolygon = decodePolygon(encodedPolygon)
        }
        const [contactData, floodData] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(decodedPolygon || polygon),
          request.server.methods.getFloodDataByPolygon(decodedPolygon || polygon)]
        )
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.areaInHectares = getAreaInHectares(decodedPolygon || polygon)
        floodData.centreOfPolygon = getCentreOfPolygon(decodedPolygon || polygon)
        floodData.isFZ1Andlt1ha = floodData.floodZone === '1' && floodData.areaInHectares < 1
        floodData.isFZ1Andgt1ha = floodData.floodZone === '1' && floodData.areaInHectares >= 1
        floodData.areaInHectares = floodData.areaInHectares !== '0' && floodData.areaInHectares !== 0 ? floodData.areaInHectares : 'less than 0.01'
        floodData.riversAndSea = floodData.floodZone !== '1' || floodData.floodZoneClimateChange || floodData.floodZoneClimateChangeNoData
        return h.view('results', { polygon, floodData, contactData, showOrderProduct4Button, decodedPolygon })
      }
    }
  }
]
