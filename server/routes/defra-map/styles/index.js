const blackAndWhiteMap = JSON.stringify(require('./OS_VTS_27700_Black_and_White.json'))
const masterMap = JSON.stringify(require('./OS_VTS_27700_Outdoor.json'))
const masterMapDark = JSON.stringify(require('./OS_VTS_27700_Dark.json'))
const vtsTile = JSON.stringify(require('./vts-tile.json'))
const p4BlackAndWhiteMap = require('../p4Styles/OS_VTS_27700_Black_and_White.json')

const { config } = require('../../../../config')
const { fmpProxyUrl } = config
const { getHostAndProtocol } = require('../../../services/getHostAndProtocol')

const method = 'GET'
const options = { tags: ['asset'] }
const generateStaticRoute = (path, jsonObject) => ({ method, path, handler: () => jsonObject, options })

const _jsonCache = {}

const replaceProxyForFileAndOrigin = (file, origin, jsonString) => {
  const cached = _jsonCache[origin]?.[file]
  if (cached) {
    console.log('Cache found for ', origin, file)
    return cached
  }
  console.log('NO Cache found for ', origin, file)
  const proxyUrl = fmpProxyUrl || `${origin}/proxy`
  // const jsonWithProxy = JSON.parse(JSON.stringify(jsonString).replaceAll('FMP_PROXY', proxyUrl))
  const jsonWithProxy = JSON.parse(jsonString.replaceAll('FMP_PROXY', proxyUrl))
  _jsonCache[origin] = _jsonCache[origin] || {}
  _jsonCache[origin][file] = jsonWithProxy
  return jsonWithProxy
}

const generateStylesRoute = (path, jsonObject) => {
  const file = path.split('/').at(-1)
  return {
    method,
    path,
    handler: (request, h) => {
      const origin = getHostAndProtocol(request)
      return h.response(replaceProxyForFileAndOrigin(file, origin, jsonObject)).type('application/json')
    },
    options
  }
}

const routes = [
  generateStylesRoute('/map/styles/vts-tile.json', vtsTile),
  generateStylesRoute('/map/styles/black-and-white-map', blackAndWhiteMap),
  generateStylesRoute('/map/styles/master-map', masterMap),
  generateStylesRoute('/map/styles/master-map-dark', masterMapDark),
  // These two files are served for the P4 creation
  generateStaticRoute('/map/productFourStyles/black-and-white-map', p4BlackAndWhiteMap),
  generateStaticRoute('/map/productFourStyles/black-and-white-map.json', p4BlackAndWhiteMap)
]

routes.generateStaticRoute = generateStaticRoute
routes.generateStylesRoute = generateStylesRoute

module.exports = routes
