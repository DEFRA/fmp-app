const config = require('../config')
const fmplogViewModel = require('./models/fmp-log-view')
const wreck = require('wreck').defaults({
  timeout: config.httpTimeoutMs
})

module.exports = {
  getJson: async (url) => {
    // $lab:coverage:off$
    const { payload } = await wreck.get(url, { json: true })
    return payload
  },
  // $lab:coverage:on$
  convertToGeoJson: (coordinates) => {
    return '{"type": "Polygon", "coordinates": [' + JSON.stringify(coordinates) + ']}'
  },
  LogMessage: async (message, error, correlationId) => {
    if (config.LogAuditTrial) {
      var fmplogdata = new fmplogViewModel()
      fmplogdata.Message = message
      fmplogdata.Error = error
      fmplogdata.CorrelationId = correlationId

      var start = new Date().getTime();
      var end = start;
      while (end < start + 3000) {
        end = new Date().getTime();
      }
      var jsonData = JSON.stringify(fmplogdata)
      await wreck.post(config.httpLogTrigger, {
        payload: jsonData
      })
    }
    return Promise.resolve(1);
  }
}
