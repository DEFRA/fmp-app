const blackAndWhiteMap = require('./OS_VTS_27700_Black_and_White.json')
const p4BlackAndWhiteMap = require('../p4Styles/OS_VTS_27700_Black_and_White.json')
const masterMap = require('./OS_VTS_27700_Outdoor.json')
const masterMapDark = require('./OS_VTS_27700_Dark.json')
const vtsTile = require('./vts-tile.json')
const { config } = require('../../../../config')
const { fmpProxyUrl } = config

const method = 'GET'
const options = { tags: ['asset'] }
const generateRoute = (path, handler) => ({ method, path, handler, options })

const generateStylesRoute = (path, jsonObject) => {
  const sprite = jsonObject._sprite
  const glyphs = jsonObject.glyphs
  if (sprite) {
    jsonObject.sprite = sprite.replace('FMP_PROXY', fmpProxyUrl)
  }
  if (glyphs) {
    jsonObject.glyphs = glyphs.replace('FMP_PROXY', fmpProxyUrl)
  }
  return { method, path, handler: () => jsonObject, options }
}

const generateVtsTileRoute = (path, jsonObject) => {
  const tiles = jsonObject.tiles[0]
  if (tiles) {
    jsonObject.tiles[0] = tiles.replace('FMP_PROXY', fmpProxyUrl)
  }
  return { method, path, handler: () => jsonObject, options }
}

module.exports = [
  generateVtsTileRoute('/map/styles/vts-tile.json', vtsTile),
  generateStylesRoute('/map/styles/black-and-white-map', blackAndWhiteMap),
  generateStylesRoute('/map/styles/master-map', masterMap),
  generateStylesRoute('/map/styles/master-map-dark', masterMapDark),
  // These two files are served for the P4 creation
  generateRoute('/map/productFourStyles/black-and-white-map', p4BlackAndWhiteMap),
  generateRoute('/map/productFourStyles/black-and-white-map.json', p4BlackAndWhiteMap)
]
