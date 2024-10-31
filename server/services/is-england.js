const { config } = require('../../config')
const { esriRequest, makePointGeometry } = require('./agol')

module.exports = {
  get: (easting, northing) => {
    if (!easting || !northing) {
      throw new Error('No point provided')
    }
    return esriRequest(config.agol.isEnglandEndPoint, makePointGeometry(easting, northing), 'esriGeometryPoint')
      .then((esriResult) => {
        const isEngland = esriResult && Array.isArray(esriResult) && esriResult.length > 0
        return { is_england: isEngland }
      })
  } // returns a Promise that resolves as { is_england: true | false }
}
