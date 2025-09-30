const { config } = require('../../config')
const {
  getAreaInHectares,
  getCentreOfPolygon
} = require('../services/shape-utils')
const { decodePolygon } = require('../services/param-polygon-decoder')

module.exports = [
  {
    method: 'GET',
    path: '/results',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon } = request.query
        const decodedPolygon = decodePolygon(polygon)
        
        const [contactData, floodData] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(decodedPolygon),
          request.server.methods.getFloodDataByPolygon(decodedPolygon)]
        )
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.areaInHectares = getAreaInHectares(decodedPolygon)
        floodData.centreOfPolygon = getCentreOfPolygon(decodedPolygon)
        floodData.isFZ1Andlt1ha = floodData.floodZone === '1' && floodData.areaInHectares < 1
        floodData.isFZ1Andgt1ha = floodData.floodZone === '1' && floodData.areaInHectares >= 1
        floodData.areaInHectares = floodData.areaInHectares !== '0' && floodData.areaInHectares !== 0 ? floodData.areaInHectares : 'less than 0.01'
        floodData.riversAndSea = floodData.floodZone !== '1' || floodData.floodZoneClimateChange || floodData.floodZoneClimateChangeNoData
        return h.view('results', { decodedPolygon, floodData, contactData, showOrderProduct4Button })
      }
    }
  }
]
