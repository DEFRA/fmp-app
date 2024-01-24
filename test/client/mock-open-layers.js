const mock = require('mock-require')

class MockIcon {
  constructor (config) {
    this.config = config
  }

  setScale (scale) {
    Object.assign(this.config, { scale })
  }
}

class MockGeometry { // Shape could be a Point or a Polygon
  constructor (coordinates) {
    this.coordinates = coordinates
  }

  getCoordinates () {
    return this.coordinates
  }

  setCoordinates (coordinates) {
    this.coordinates = coordinates
  }
}

class MockShape { // Shape could be a Point or a Polygon
  constructor (coordinates) {
    this.geometry = new MockGeometry(coordinates)
  }

  getGeometry () {
    return this.geometry
  }
}
const MockMapExtents = (size, center, resolution) => ({
  getView: () => MockView(center, resolution, size),
  getSize: () => size
})

const MockView = (center, resolution, size) => ({
  getCenter: () => center,
  getResolution: () => resolution,
  calculateExtent: () => {
    const eastingOffset = size[0] * resolution * 0.5
    const northingOffset = size[1] * resolution * 0.5
    return [
      Math.floor(center[0] - eastingOffset),
      Math.floor(center[1] - northingOffset),
      Math.ceil(center[0] + eastingOffset),
      Math.ceil(center[1] + northingOffset)
    ]
  }
})

class MockTileLayer {
  constructor (config) {
    this.config = config
  }

  setVisible () {}
}

class MockCollection extends Array {
  constructor (_val) { // Collection constructor expects an array param, but Array doesn't
    super()
  }

  extend (val) {
    return this.concat(val)
  }
}

const mockOpenLayers = () => {
  const defaultMock = function (config) { return config }
  mock('ol/layer/Tile', { default: MockTileLayer })
  mock('ol/source/TileWMS', { default: defaultMock })
  mock('ol/tilegrid/TileGrid', { default: defaultMock })
  mock('ol/style/Icon', { default: MockIcon })
  mock('ol/Feature', { default: defaultMock })
  mock('ol/geom/Point', { default: defaultMock })
  mock('ol/Collection', { default: MockCollection })
  mock('ol/control/ScaleLine', { default: defaultMock })
  mock('ol/control/FullScreen', { default: defaultMock })

  return () => {
    mock.stop('ol/layer/Tile')
    mock.stop('ol/source/TileWMS')
    mock.stop('ol/tilegrid/TileGrid')
    mock.stop('ol/style/Icon')
    mock.stop('ol/Feature')
    mock.stop('ol/geom/Point')
    mock.stop('ol/Collection')
    mock.stop('ol/control/ScaleLine')
    mock.stop('ol/control/FullScreen')
  }
}

module.exports = { mockOpenLayers, MockShape, MockView, MockMapExtents }
