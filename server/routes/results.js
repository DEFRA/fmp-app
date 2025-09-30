const { config } = require('../../config')
const {
  getAreaInHectares,
  getCentreOfPolygon
} = require('../services/shape-utils')
const { decode } = require('@mapbox/polyline')

module.exports = [
  {
    method: 'GET',
    path: '/results',
    options: {
      description: 'Results Page',
      handler: async (request, h) => {
        const { polygon } = request.query
        let parsedPolygon
        try {
          const confirmedJSON = JSON.parse(polygon)
          if (Array.isArray(confirmedJSON) && Array.isArray(confirmedJSON[0])) {
            parsedPolygon = polygon
          } else {
            throw new Error('not a polygon array')
          }
        } catch {
          const decodedResult = decode(polygon)
          parsedPolygon = JSON.stringify(decodedResult)
        }
        const [contactData, floodData] = await Promise.all([
          request.server.methods.getPsoContactsByPolygon(parsedPolygon),
          request.server.methods.getFloodDataByPolygon(parsedPolygon)]
        )
        const showOrderProduct4Button = config.appType === 'internal' || contactData.useAutomatedService === true
        floodData.areaInHectares = getAreaInHectares(parsedPolygon)
        floodData.centreOfPolygon = getCentreOfPolygon(parsedPolygon)
        floodData.isFZ1Andlt1ha = floodData.floodZone === '1' && floodData.areaInHectares < 1
        floodData.isFZ1Andgt1ha = floodData.floodZone === '1' && floodData.areaInHectares >= 1
        floodData.areaInHectares = floodData.areaInHectares !== '0' && floodData.areaInHectares !== 0 ? floodData.areaInHectares : 'less than 0.01'
        floodData.riversAndSea = floodData.floodZone !== '1' || floodData.floodZoneClimateChange || floodData.floodZoneClimateChangeNoData
        return h.view('results', { parsedPolygon, floodData, contactData, showOrderProduct4Button })
      }
    }
  }
]
