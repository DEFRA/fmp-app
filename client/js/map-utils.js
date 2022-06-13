const TileLayer = require('ol/layer/Tile').default
const TileWMS = require('ol/source/TileWMS').default
const TileGrid = require('ol/tilegrid/TileGrid').default
const Icon = require('ol/style/Icon').default

const createTileLayer = mapConfig => {
  return new TileLayer({
    ref: 'fmp',
    opacity: 0.7,
    zIndex: 0,
    source: new TileWMS({
      url: mapConfig.tileProxy,
      serverType: 'geoserver',
      params: {
        LAYERS: 'fmp:fmp',
        TILED: true,
        VERSION: '1.1.1'
      },
      tileGrid: new TileGrid({
        extent: mapConfig.tileExtent,
        resolutions: mapConfig.tileResolutions,
        tileSize: mapConfig.tileSize
      })
    })
  })
}

let sessionStorageAvailable = true
try {
  sessionStorageAvailable = Boolean(window.sessionStorage)
} catch (ex) {
  // stop an error being logged in the browser when sessionStorage is turned off
  sessionStorageAvailable = false
}

const _mockSessionStorageAvailable = value => {
  const currentValue = sessionStorageAvailable
  sessionStorageAvailable = value
  return currentValue
}

const mapState = {
  getItem: name => sessionStorageAvailable
    ? window.sessionStorage.getItem(name)
    : undefined,
  setItem: (name, value) => sessionStorageAvailable
    ? window.sessionStorage.setItem(name, value)
    : undefined,
  removeItem: name => sessionStorageAvailable
    ? window.sessionStorage.removeItem(name)
    : undefined
}

const getCenterOfExtent = extent => {
  const X = extent[0] + (extent[2] - extent[0]) / 2
  const Y = extent[1] + (extent[3] - extent[1]) / 2
  return [parseInt(X, 10), parseInt(Y, 10)]
}

function getTargetUrl (featureMode, polygon, point, location, fullName, recipientemail) {
  let coordinates
  let url = '/flood-zone-results'

  if (featureMode === 'polygon' && polygon) {
    const geometry = polygon.getGeometry()
    coordinates = geometry.getCoordinates()[0]
    const extent = geometry.getExtent()
    const center = getCenterOfExtent(extent)
    const coords = JSON.stringify(coordinates.map(function (item) {
      return [parseInt(item[0], 10), parseInt(item[1], 10)]
    }))
    url += '?polygon=' + coords
    url += '&center=' + JSON.stringify(center)
  } else {
    coordinates = point.getGeometry().getCoordinates()
    url += '?easting=' + parseInt(coordinates[0], 10)
    url += '&northing=' + parseInt(coordinates[1], 10)
  }
  url += '&location=' + location
  url += '&fullName=' + fullName
  url += '&recipientemail=' + recipientemail

  return url
}

const getPolygonNodeIcon = resolution => {
  const icon = new Icon({
    opacity: 1,
    size: [32, 32],
    scale: 0.5,
    src: '/assets/images/map-draw-cursor-2x.png'
  })
  if (!isNaN(resolution)) {
    resolution = 1 + parseFloat(resolution, 10)
    const scale = 0.5 / Math.pow(resolution, 2)
    icon.setScale(scale)
  }
  return icon
}

module.exports = { createTileLayer, mapState, _mockSessionStorageAvailable, getTargetUrl, getPolygonNodeIcon }
