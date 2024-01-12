const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const { MapController } = require('../../client/js/map-controller')
const sinon = require('sinon')

const map = {
  setVisibleBaseMapLayer: sinon.stub()
}

lab.experiment('MapController', () => {
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
    mapController = new MapController(map)
    sinon.restore()
  })

  lab.test('mapController should be instantiated', async () => {
    Code.expect(mapController instanceof MapController).to.equal(true)
  })

  // MapController initialisation
  lab.test('mapController.initialise should addBaseMapRadioClickEvents to all baseMap elements', async () => {
    const addBaseMapRadioClickEventsSpy = sinon.spy(mapController, 'addBaseMapRadioClickEvents')
    mapController.initialise()
    sinon.assert.calledOnce(addBaseMapRadioClickEventsSpy)
    sinon.assert.calledWith(addBaseMapRadioClickEventsSpy, 'base-map')
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
    mapController.climateChangeScenario = 'ccp-1'
    Code.expect(mapController.climateChangeScenario).to.equal('ccp-1')
  })

  /*
  Set Climate Change Scenario:
    present-day, ccp-1, ccp-2
  show/hide FMfP and Surface Water layers
  Get all Visible Layers
  Request a legend for all visible layers
    - Should expect an array of layer names
    - eg ['flood_zone_2_3_rivers_and_sea', 'rivers_1in30_sea_1in30_defended', ... etc]
    - Should return the html (or possibly json with client side code to display html)
  Show Key or Legend as tabbed pickers
  Scroll When there is too much to show on the screen
  Work on Mobile Devices

  The floodMapController should handle all of the above
  The floodMapController should recieve parameters:
    map
    baseMapLayers

  the map instance should have members (when mocking):
    setVisibleBaseMapLayer
*/
})
