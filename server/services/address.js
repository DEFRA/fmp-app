const util = require('../util')
const config = require('../../config')
const { osNamesUrl, osSearchKey } = config.ordnanceSurvey
const fqFilter = 'LOCAL_TYPE:City%20LOCAL_TYPE:Hamlet%20LOCAL_TYPE:Other_Settlement%20LOCAL_TYPE:Suburban_Area%20LOCAL_TYPE:Town%20LOCAL_TYPE:PostCode'

module.exports = {
  findByPlace: async (place) => {
    const uri = `${osNamesUrl}${place}&key=${osSearchKey}&fq=${fqFilter}`
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
