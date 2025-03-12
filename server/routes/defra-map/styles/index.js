const baseMapDefault = require('./OS_VTS_27700_Open_Outdoor.json')
const baseMapDark = require('./OS_VTS_27700_Open_Dark.json')
const polygonDefault = require('./OS_VTS_27700_Outdoor.json')
const polygonDark = require('./OS_VTS_27700_Dark.json')
const openTile = require('./open-tile.json')
const vtsTile = require('./vts-tile.json')

module.exports = [
  {
    method: 'GET',
    path: '/map/styles/open-tile.json',
    handler: () => openTile,
    options: {
      tags: ['asset']
    }
  }, {
    method: 'GET',
    path: '/map/styles/vts-tile.json',
    handler: () => vtsTile,
    options: {
      tags: ['asset']
    }
  }, {
    method: 'GET',
    path: '/map/styles/base-map-default',
    handler: () => baseMapDefault,
    options: {
      tags: ['asset']
    }
  }, {
    method: 'GET',
    path: '/map/styles/base-map-dark',
    handler: () => baseMapDark,
    options: {
      tags: ['asset']
    }
  }, {
    method: 'GET',
    path: '/map/styles/polygon-default',
    handler: () => polygonDefault,
    options: {
      tags: ['asset']
    }
  }, {
    method: 'GET',
    path: '/map/styles/polygon-dark',
    handler: () => polygonDark,
    options: {
      tags: ['asset']
    }
  }
]
