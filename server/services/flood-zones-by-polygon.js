const util = require('../util')
const config = require('../../config')
const url = config.service + '/flood-zones-by-polygon?polygon='

const getFloodZonesByPolygon = (polygon) => {
  try {
    const geoJsonPolygon = util.convertToGeoJson(polygon)
    const myurl = url + geoJsonPolygon
    return util.getJson(myurl).then((result) => result)
  } catch (error) {
    throw new Error('Fetching Pso contacts by polygon failed: ', error)
  }
}

const expiresIn = 600000 // 10 minutes
const staleIn = 540000 // 9 minutes
const generateTimeout = 10000 // 10 seconds
const staleTimeout = 59000 // 59 seconds

module.exports = {
  name: 'getFloodZonesByPolygon',
  method: getFloodZonesByPolygon,
  options: {
    cache: {
      cache: 'FMFP',
      expiresIn,
      staleIn,
      generateTimeout,
      staleTimeout
    },
    generateKey: (polygon) => JSON.stringify(polygon)
  }
}
