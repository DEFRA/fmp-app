const blackAndWhiteMap = require('./OS_VTS_27700_Black_and_White.json')
const p4BlackAndWhiteMap = require('../p4Styles/OS_VTS_27700_Black_and_White.json')
const masterMap = require('./OS_VTS_27700_Outdoor.json')
const masterMapDark = require('./OS_VTS_27700_Dark.json')
const vtsTile = require('./vts-tile.json')
const { config } = require('../../../../config')
const { fmpProxyUrl } = config
const { getHostAndProtocol } = require('../../../services/getHostAndProtocol')

const method = 'GET'
const options = { tags: ['asset'] }
const generateStaticRoute = (path, jsonObject) => ({ method, path, handler: () => jsonObject, options })

const _jsonCache = {}

const replaceProxyForFileAndOrigin = (file, origin, jsonObject) => {
  const cached = _jsonCache[origin]?.[file]
  if (cached) {
    console.log('Cache found for ', origin, file)
    return cached
  }
  console.log('NO Cache found for ', origin, file)
  const jsonWithProxy = getJsonWithProxy(origin, jsonObject)
  _jsonCache[origin] = _jsonCache[origin] || {}
  _jsonCache[origin][file] = jsonWithProxy
  return jsonWithProxy
}

const getJsonWithProxy = (origin, jsonObject) => {
  const proxyUrl = fmpProxyUrl || `${origin}/proxy`
  const sprite = jsonObject._sprite
  const glyphs = jsonObject.glyphs
  const tiles = jsonObject.tiles?.[0]
  if (sprite) {
    jsonObject.sprite = sprite.replace('FMP_PROXY', proxyUrl)
  }
  if (glyphs) {
    jsonObject.glyphs = glyphs.replace('FMP_PROXY', proxyUrl)
  }
  if (tiles) {
    jsonObject.tiles[0] = tiles.replace('FMP_PROXY', proxyUrl)
  }
  return jsonObject
}

const generateStylesRoute = (path, jsonObject) => {
  const file = path.split('/').at(-1)
  return {
    method,
    path,
    handler: (request) => {
      const origin = getHostAndProtocol(request)
      return replaceProxyForFileAndOrigin(file, origin, jsonObject)
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
