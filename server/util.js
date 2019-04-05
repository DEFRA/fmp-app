const HttpsProxyAgent = require('https-proxy-agent')
const config = require('../config')
const wreck = require('wreck').defaults({
  timeout: config.httpTimeoutMs
})
let wreckExt
if (config.http_proxy) {
  wreckExt = require('wreck').defaults({
    timeout: config.httpTimeoutMs,
    agent: new HttpsProxyAgent(config.proxy)
  })
}

module.exports = {
  get: async (url, ext = false) => {
    const thisWreck = (ext && wreckExt) ? wreckExt : wreck
    const { payload } = await thisWreck.get(url)
    return payload
  },
  getJson: async (url, ext = false) => {
    const thisWreck = (ext && wreckExt) ? wreckExt : wreck
    const { payload } = await thisWreck.get(url, { json: true })
    return payload
  },
  convertToGeoJson: (coordinates) => {
    return '{"type": "Polygon", "coordinates": [' + JSON.stringify(coordinates) + ']}'
  }
}
