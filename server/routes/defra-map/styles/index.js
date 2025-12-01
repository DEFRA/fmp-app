const blackAndWhiteMap = require('./OS_VTS_27700_Black_and_White.json')
const masterMap = require('./OS_VTS_27700_Outdoor.json')
const masterMapDark = require('./OS_VTS_27700_Dark.json')
const openTile = require('./open-tile.json')
const vtsTile = require('./vts-tile.json')

const method = 'GET'
const options = { tags: ['asset'] }
const generateRoute = (path, handler) => ({ method, path, handler, options })

module.exports = [
  generateRoute('/map/styles/open-tile.json', () => openTile),
  generateRoute('/map/styles/vts-tile.json', () => vtsTile),
  generateRoute('/map/styles/black-and-white-map', () => blackAndWhiteMap),
  generateRoute('/map/styles/master-map', () => masterMap),
  generateRoute('/map/styles/master-map-dark', () => masterMapDark)
]
