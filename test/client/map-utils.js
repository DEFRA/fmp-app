const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const mapConfig = require('../../client/js/map-config.json')
const { mockOpenLayers, MockShape, MockMapExtents } = require('./mock-open-layers')

const sessionStorage = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => (store[key] = value.toString()),
    removeItem: (key) => delete store[key],
    clear: () => (store = {})
  }
})()

lab.experiment('map-utils', () => {
  let createTileLayer
  let mapState
  let restoreStorageAvailable
  let mapUtils
  let restoreOpenLayers

  lab.before(async () => {
    restoreOpenLayers = mockOpenLayers()
    global.window = { sessionStorage }
    mapUtils = require('../../client/js/map-utils')
    restoreStorageAvailable = mapUtils._mockSessionStorageAvailable(true)
    createTileLayer = mapUtils.createTileLayer
    mapState = mapUtils.mapState
  })

  lab.afterEach(async () => {
    global.window.sessionStorage.clear()
  })

  lab.after(async () => {
    restoreOpenLayers()
    mapUtils._mockSessionStorageAvailable(restoreStorageAvailable)
  })

  lab.test('createTileLayer', async () => {
    const tileLayer = createTileLayer(mapConfig)
    Code.expect(tileLayer).to.equal({
      ref: 'fmp',
      opacity: 0.7,
      zIndex: 0,
      source: {
        url: '/gwc-proxy',
        serverType: 'geoserver',
        params: { LAYERS: 'fmp:fmp', TILED: true, VERSION: '1.1.1' },
        tileGrid: {
          extent: [0, 0, 1000000, 1120000],
          resolutions: [896, 448, 224, 112, 56, 28, 14, 7, 3.5, 1.75, 0.875],
          tileSize: [250, 250]
        }
      }
    })
  })

  lab.test('mapState.getItem calls should be initially null', async () => {
    Code.expect(mapState.getItem('point')).to.be.null()
  })

  lab.test('mapState.setItem followed by getItem should return the set item', async () => {
    Code.expect(mapState.getItem('point')).to.be.null()
    mapState.setItem('point', '12345')
    Code.expect(mapState.getItem('point')).to.equal('12345')
  })

  lab.test('mapState.removeItem should remove the item from storage', async () => {
    Code.expect(mapState.getItem('point')).to.be.null()
    mapState.setItem('point', '12345')
    Code.expect(mapState.getItem('point')).to.equal('12345')
    mapState.removeItem('point')
    Code.expect(mapState.getItem('point')).to.be.null()
  })

  lab.test('getTargetUrl with a point', async () => {
    const point = {
      getGeometry: () => ({ getCoordinates: () => [479922, 484181] })
    }
    const url = mapUtils.getTargetUrl('point', undefined, point, 'pickering', 'Joe Bloggs', 'joe@example.com')
    Code.expect(url).equals('/flood-zone-results?easting=479922&northing=484181&location=pickering')
  })

  lab.test('getTargetUrl with a point with decimal precision', async () => {
    const point = {
      getGeometry: () => ({ getCoordinates: () => [479922.12345, 484181.67891] })
    }
    const url = mapUtils.getTargetUrl('point', undefined, point, 'pickering', 'Joe Bloggs', 'joe@example.com')
    Code.expect(url).equals('/flood-zone-results?easting=479922&northing=484182&location=pickering')
  })

  lab.test('getTargetUrl with a polygon', async () => {
    const polygon = {
      getGeometry: () => ({
        getExtent: () => [479816, 484194, 480082, 484404],
        getCoordinates: () => [
          [
            [479926, 484194],
            [480082, 484297],
            [480015, 484387],
            [479829, 484404],
            [479816, 484204],
            [479926, 484194]
          ]
        ]
      })
    }

    const url = mapUtils.getTargetUrl('polygon', polygon, undefined, 'pickering', 'Joe Bloggs', 'joe@example.com')
    Code.expect(url).equals(
      '/flood-zone-results?polygon=[[479926,484194],[480082,484297],[480015,484387],[479829,484404],[479816,484204],[479926,484194]]&center=[479949,484299]&location=pickering'
    )
  })

  lab.test('getTargetUrl with a polygon with decimal precision', async () => {
    const polygon = {
      getGeometry: () => ({
        getExtent: () => [479816, 484194, 480082, 484404],
        getCoordinates: () => [
          [
            [479926.12345, 484194.12345],
            [480082.12345, 484297.12345],
            [480015.12345, 484387.12345],
            [479829.6789, 484404.6789],
            [479816.12345, 484204.12345],
            [479926.12345, 484194.12345]
          ]
        ]
      })
    }

    const url = mapUtils.getTargetUrl('polygon', polygon, undefined, 'pickering', 'Joe Bloggs', 'joe@example.com')
    Code.expect(url).equals(
      '/flood-zone-results?polygon=[[479926,484194],[480082,484297],[480015,484387],[479830,484405],[479816,484204],[479926,484194]]&center=[479949,484299]&location=pickering'
    )
  })

  lab.test("getTargetUrl when featureMode is polygon but a polygon isn't yet defined", async () => {
    const point = {
      getGeometry: () => ({ getCoordinates: () => [479922, 484181] })
    }
    const url = mapUtils.getTargetUrl('polygon', undefined, point, 'pickering', 'Joe Bloggs', 'joe@example.com')
    Code.expect(url).equals('/flood-zone-results?easting=479922&northing=484181&location=pickering')
  })

  lab.test('I can create a polygon point icon with getPolygonNodeIcon', async () => {
    const { getPolygonNodeIcon } = mapUtils
    const icon = getPolygonNodeIcon()
    Code.expect(icon.config).to.equal({
      opacity: 1,
      size: [32, 32],
      scale: 0.5,
      src: '/assets/images/map-draw-cursor-2x.png'
    })
  })

  lab.test('I can create a polygon point icon with getPolygonNodeIcon zoomed to a specific resolution', async () => {
    const { getPolygonNodeIcon } = mapUtils
    const icon = getPolygonNodeIcon(0.5)
    Code.expect(icon.config).to.equal({
      opacity: 1,
      size: [32, 32],
      scale: 0.3333333333333333,
      src: '/assets/images/map-draw-cursor-2x.png'
    })
  })

  const roundCoordinateValues = [
    [0, 0],
    [1, 1],
    [1.1, 1],
    [1.5, 2],
    ['0', 0],
    ['1', 1],
    ['1.1', 1],
    ['1.5', 2],
    [
      ['1.5', '1.1'],
      [2, 1]
    ],
    [
      [
        ['1.5', '1.1'],
        [473212.23557, 493717.83557],
        [473212.23557, 493717.83557]
      ], // A nested array like this
      [
        [2, 1],
        [473212, 493718],
        [473212, 493718]
      ]
    ] // Should return a rounded nested array like this
  ]
  roundCoordinateValues.forEach(([value, expectedResult]) => {
    lab.test(
      `round coordinates should return rounded values ${JSON.stringify(expectedResult)} when passed value ${JSON.stringify(value)}`,
      async () => {
        const shape = new MockShape(value)
        Code.expect(mapUtils.snapCoordinates(shape).getGeometry().getCoordinates()).to.equal(expectedResult)
      }
    )
  })

  const mapSizes = {
    zero: [0, 0],
    small: [100, 100],
    medium: [200, 250],
    large: [400, 500]
  }

  const mapCenters = {
    zero: [0, 0],
    defined: [480, 490]
  }

  const mapResolutions = {
    zero: 0,
    small: 0.2,
    large: 0.5
  }
  const undefinedExtents = [undefined, undefined]
  const zeroExtents = [
    [0, 0],
    [0, 0]
  ]
  const mapSizeCenterResolutions = [
    [mapSizes.zero, mapCenters.zero, mapResolutions.zero, zeroExtents], // Zero Resolution expects zeroExtents
    [mapSizes.zero, mapCenters.zero, mapResolutions.small, zeroExtents], // Zero Center also expects zeroExtents
    [mapSizes.zero, mapCenters.zero, mapResolutions.large, undefinedExtents], // large resolution expects undefinedExtents
    [mapSizes.small, mapCenters.defined, mapResolutions.zero, [mapCenters.defined, mapCenters.defined]], // Zero Resolution expects mapCenters
    [
      mapSizes.small,
      mapCenters.defined,
      mapResolutions.small,
      [
        [470, 480],
        [490, 500]
      ]
    ], // small resolution expects +-10 ie (0.2 * 100 /2)
    [mapSizes.small, mapCenters.defined, mapResolutions.large, undefinedExtents], // large resolution expects undefinedExtents
    [mapSizes.medium, mapCenters.defined, mapResolutions.zero, [mapCenters.defined, mapCenters.defined]], // Zero Resolution expects mapCenters
    [
      mapSizes.medium,
      mapCenters.defined,
      mapResolutions.small,
      [
        [460, 465],
        [500, 515]
      ]
    ], // small resolution expects +-20, 25 ie (0.2 * 200/2, 0.2 * 250/2)
    [mapSizes.medium, mapCenters.defined, mapResolutions.large, undefinedExtents], // large resolution expects undefinedExtents
    [mapSizes.large, mapCenters.defined, mapResolutions.zero, [mapCenters.defined, mapCenters.defined]], // Zero Resolution expects mapCenters
    [
      mapSizes.large,
      mapCenters.defined,
      mapResolutions.small,
      [
        [440, 440],
        [520, 540]
      ]
    ], // small resolution expects +-40, 50 ie (0.2 * 400/2, 0.2 * 500/2)
    [mapSizes.large, mapCenters.defined, mapResolutions.large, undefinedExtents] // large resolution expects undefinedExtents
  ]
  mapSizeCenterResolutions.forEach(([size, center, resolution, [expectedTopLeft, expectedBottomRight]]) => {
    lab.test(
      `getCartesianViewExtents should return ${JSON.stringify([expectedTopLeft, expectedBottomRight])} when passed a map with size ${JSON.stringify(size)}`,
      async () => {
        const map = MockMapExtents(size, center, resolution)
        const extents = mapUtils.getCartesianViewExtents(map)
        Code.expect(extents).to.equal([expectedTopLeft, expectedBottomRight])
      }
    )
  })

  lab.test('extendMapControls will not include fullscreen controls if false is passed', async () => {
    const controls = mapUtils.extendMapControls(false)
    Code.expect(controls).to.equal([{ units: 'metric', minWidth: 50 }])
  })

  lab.test('extendMapControls will include fullscreen controls if true is passed', async () => {
    const controls = mapUtils.extendMapControls(true)
    Code.expect(controls).to.equal([{ units: 'metric', minWidth: 50 }, { source: 'map--result' }])
  })
})
