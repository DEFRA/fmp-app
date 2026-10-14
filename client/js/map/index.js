import { FmpMap } from '@defra/fmp-map'

const ENGLAND_WEST = 50000
const ENGLAND_SOUTH = 40000
const ENGLAND_EAST = 400000
const ENGLAND_NORTH = 650000

if (!FmpMap) {
  throw new Error('FmpMap is not available on the window object')
}

const createFmpMap = () => {
  return new FmpMap({
    behaviour: 'inline',
    place: 'England',
    minZoom: 6,
    maxZoom: 20,
    extent: [ENGLAND_WEST, ENGLAND_SOUTH, ENGLAND_EAST, ENGLAND_NORTH],
    containerHeight: '100%',
    enableMapControls: false,
    enableZoomControls: true,
    plugins: FmpMap.createPlugins()
  })
}

FmpMap.initialise().then(() => {
  /*
    // To update a plugin: get its current values, modify them, as below,
    // and then call FmpMap.updatePlugin with the new values to apply the changes
    const mapStyleValues = FmpMap.getPluginValues('mapStyle')
    // mapStyleValues.manifest.buttons[0].desktop.slot = 'right-top'
    mapStyleValues.manifest.panels[0].label = 'My map styles'
    FmpMap.updatePlugin('mapStyle', mapStyleValues)

    console.log('getPluginValues', FmpMap.getPluginValues())
  */
  // all calls to updatePlugin must be called before the call to createFmpMap
  createFmpMap()
})
