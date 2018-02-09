const config = require('../config')
const wreck = require('wreck').defaults({
  timeout: config.httpTimeoutMs
})

module.exports = {
  getJson: async (url) => {
    const { payload } = await wreck.get(url, { json: true })
    return payload
  },
  convertToGeoJson: (coordinates) => {
    return '{"type": "Polygon", "coordinates": [' + JSON.stringify(coordinates) + ']}'
  }
}
