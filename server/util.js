const moment = require('moment-timezone')
const HttpsProxyAgent = require('https-proxy-agent')
const config = require('./../config')
const wreck = require('@hapi/wreck').defaults({
  timeout: config.httpTimeoutMs
})

let wreckExt
if (config.httpsProxy) {
  wreckExt = require('@hapi/wreck').defaults({
    timeout: config.httpTimeoutMs,
    agent: new HttpsProxyAgent(config.httpsProxy)
  })
}

function request (method, url, options, ext = false) {
  const thisWreck = ext && wreckExt ? wreckExt : wreck
  return thisWreck[method](url, options).then((response) => {
    const res = response.res
    const payload = response.payload

    if (res.statusCode !== 200) {
      const err = payload || new Error('Unknown error')
      throw err
    }

    return payload
  })
}

function convertToGeoJson (coordinates) {
  coordinates = Array.isArray(coordinates) ? JSON.stringify(coordinates) : coordinates
  return '{"type": "Polygon", "coordinates": [' + coordinates + ']}'
}

function get (url, options, ext = false) {
  return request('get', url, options, ext)
}

function post (url, options) {
  return request('post', url, options)
}

function postJson (url, options) {
  options = options || {}
  options.json = true

  return post(url, options)
}

function getJson (url, ext = false) {
  return get(url, { json: true }, ext)
}

function formatDate (value, format = 'h:mma dddd D MMMM YYYY') {
  return moment(value).tz('Europe/London').format(format)
}

function toFixed (value, dp) {
  if (value) {
    return Number(Math.round(value + 'e' + dp) + 'e-' + dp).toFixed(dp)
  } else {
    return value
  }
}

function groupBy (arr, prop) {
  return arr.reduce(function (groups, item) {
    const val = item[prop]
    groups[val] = groups[val] || []
    groups[val].push(item)
    return groups
  }, {})
}

module.exports = {
  convertToGeoJson,
  get,
  post,
  getJson,
  postJson,
  request,
  formatDate,
  toFixed,
  groupBy
}
