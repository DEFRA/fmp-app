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
  getView: () => MockView(center, resolution),
  getSize: () => size
})

const MockView = (center, resolution) => ({
  getCenter: () => center,
  getResolution: () => resolution
})

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
  mock('ol/layer/Tile', { default: defaultMock })
  mock('ol/source/TileWMS', { default: defaultMock })
  mock('ol/tilegrid/TileGrid', { default: defaultMock })
  mock('ol/style/Icon', { default: MockIcon })
  mock('ol/Feature', { default: defaultMock })
  mock('ol/geom/Point', { default: defaultMock })
  mock('ol/Collection', { default: MockCollection })

  return () => {
    mock.stop('ol/layer/Tile')
    mock.stop('ol/source/TileWMS')
    mock.stop('ol/tilegrid/TileGrid')
    mock.stop('ol/style/Icon')
    mock.stop('ol/Feature')
    mock.stop('ol/geom/Point')
    mock.stop('ol/Collection')
  }
}

module.exports = { mockOpenLayers, MockShape, MockView, MockMapExtents }
