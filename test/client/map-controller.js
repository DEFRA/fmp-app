const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const { mockOpenLayers } = require('./mock-open-layers')

const sinon = require('sinon')

const map = {
  setVisibleBaseMapLayer: sinon.stub()
}

lab.experiment('MapController', () => {
  let restoreOpenLayers
  let MapController
  lab.before(async () => {
    restoreOpenLayers = mockOpenLayers()
    MapController = require('../../client/js/map-controller').MapController
  })

  lab.after(async () => {
    restoreOpenLayers()
  })

  const radioOutdoor = sinon.stub()
  const radioLeisure = sinon.stub()
  const radioRoad = sinon.stub()
  const radioLight = sinon.stub()

  global.document = sinon.stub()
  global.document.getElementsByName = sinon.stub().returns([
    radioOutdoor, radioLeisure, radioRoad, radioLight
  ])

  let mapController
  lab.beforeEach(async () => {
    sinon.restore()
    mapController = new MapController()
    mapController.map = map
  })

  lab.test('mapController should be instantiated', async () => {
    Code.expect(mapController instanceof MapController).to.equal(true)
  })

  // Get and Set Base Map
  lab.test('mapController.baseMap should be Outdoor_27700', async () => {
    Code.expect(mapController.baseMap).to.equal('Outdoor_27700')
  })

  lab.test('I can set a mapController baseMap and map.setVisibleBaseMapLayer will be called', async () => {
    // 'Outdoor_27700', 'Leisure_27700', 'Road_27700', 'Light_27700'
    mapController.baseMap = 'Leisure_27700'
    Code.expect(mapController.baseMap).to.equal('Leisure_27700')
    sinon.assert.calledOnce(map.setVisibleBaseMapLayer)
    sinon.assert.calledWith(map.setVisibleBaseMapLayer, 'Leisure_27700')
  })

  // Get and Set ClimateChangeScenario
  lab.test('mapController.climateChangeScenario should be present-day', async () => {
    Code.expect(mapController.climateChangeScenario).to.equal('present-day')
  })

  lab.test('I can set a mapController climateChangeScenario', async () => {
    mapController.climateChangeScenario = 'ccp1'
    Code.expect(mapController.climateChangeScenario).to.equal('ccp1')
  })

  // Visible Layers
  lab.test('a mapController should start with have no visibleLayers', async () => {
    Code.expect(mapController.visibleLayers).to.equal({})
  })

  lab.test('a mapController should start with have no visibleLayers', async () => {
    Code.expect(mapController.visibleLayers).to.equal({})
  })

  lab.test('mapController._availableLayers', async () => {
    console.log(mapController._availableLayers)
    console.log(mapController._riversAndSeaLayers)
    console.log(mapController._surfaceWaterLayers)
    console.log(mapController._otherLayers)
    console.log(mapController._allLayers)
  })

  lab.test('When I set a mapController layer to be visible, by its title, visible layers will update as expected', async () => {
    mapController.showHideLayer('Rivers and sea - flood zones 2 and 3', true)
    Code.expect(mapController.visibleLayers).to.equal({ 'fmp:flood_zone_2_3_rivers_and_sea': true })
  })

  lab.test('When I set a mapController layer to be visible, by its title, with an altered climateChangeScenario visible layers will update as expected', async () => {
    mapController.showHideLayer('Rivers and sea - flood zones 2 and 3', true)
    mapController.climateChangeScenario = 'ccp1'
    Code.expect(mapController.visibleLayers).to.equal({ 'fmp:flood_zone_2_3_rivers_and_sea_ccp1': true })
  })

  lab.test('When I set a few mapController layers to be visible, visible layers will update as expected', async () => {
    mapController.showHideLayer('Rivers - 1%, sea 0.5% AEP - defended depth', true)
    mapController.showHideLayer('Rivers and sea - 0.1% AEP - undefended depth', true)
    mapController.showHideLayer('Surface water - 3.3% AEP - depth', true)
    mapController.showHideLayer('Main rivers', true)
    Code.expect(mapController.visibleLayers).to.equal({
      'fmp:rivers_1in100_sea_1in200_defended_depth': true,
      'fmp:rivers_1in1000_sea_1in1000_undefended_depth': true,
      'fmp:surface_water_spatial_planning_1in30_depth': true,
      'fmp:main_rivers_10k': true
    })
  })

  /*
  Set Climate Change Scenario:
    present-day, ccp1, ccp2 - done
  show/hide FMfP and Surface Water layers  - done
  Get all Visible Layers  - done
  Request a legend for all visible layers
    - Should expect an array of layer names
    - eg ['flood_zone_2_3_rivers_and_sea', 'rivers_1in30_sea_1in30_defended', ... etc]
    - Should return the html (or possibly json with client side code to display html)
  Show Key or Legend as tabbed pickers
  Scroll When there is too much to show on the screen  - done
  Work on Mobile Devices

  The floodMapController should handle all of the above
  The floodMapController should recieve parameters:
    map
    baseMapLayers

  the map instance should have members (when mocking):
    setVisibleBaseMapLayer
*/
})
