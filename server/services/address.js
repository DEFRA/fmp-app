const sprintf = require('sprintf-js')
const util = require('../util')
const config = require('../../config')
const urlNamesApi = config.ordnanceSurvey.namesUrl

module.exports = {
  findByPlace: async (place) => {
    const uri = sprintf.vsprintf(urlNamesApi, [place])
    const payload = await util.getJson(uri)

    if (!payload || !payload.results || !payload.results.length) {
      return []
    }

    const gazetteerEntries = payload.results.map(function (item) {
      return {
        geometry_x: item.GAZETTEER_ENTRY.GEOMETRY_X,
        geometry_y: item.GAZETTEER_ENTRY.GEOMETRY_Y
      }
    })
    return gazetteerEntries
  }
}
