const { getPsoContactsByPolygon } = require('../services/pso-contact-by-polygon')
const { getFloodDataByPolygon } = require('../services/floodDataByPolygon')
const expiresIn = 600000 // 10 minutes
const staleIn = 540000 // 9 minutes
const generateTimeout = 20000 // 20 seconds
const staleTimeout = 59000 // 59 seconds

const serverMethods = [
  {
    name: 'getPsoContactsByPolygon',
    method: getPsoContactsByPolygon,
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
  },
  {
    name: 'getFloodDataByPolygon',
    method: getFloodDataByPolygon,
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
  }]

module.exports = serverMethods
