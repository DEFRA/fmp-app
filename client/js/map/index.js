import InteractiveMap from '@defra/interactive-map'
import esriProvider from '@defra/interactive-map/providers/esri'
import { setupEsriConfig, getDefraMapConfig } from './mapConfig.js'
import { siteBoundary } from './interactive-map-helpers/siteBoundary.js'
import { mapState } from './interactive-map-helpers/mapState.js'
import { initialisePlugins, attachInteractiveMapToPlugins } from './plugins/initialisePlugins.js'

const ENGLAND_WEST = 50000
const ENGLAND_SOUTH = 40000
const ENGLAND_EAST = 400000
const ENGLAND_NORTH = 650000

getDefraMapConfig().then((defraMapConfig) => {
  mapState.defraMapConfig = defraMapConfig

  const interactiveMap = new InteractiveMap('map', {
    mapProvider: esriProvider({
      setupConfig: setupEsriConfig
    }),
    plugins: initialisePlugins(defraMapConfig),
    behaviour: 'inline',
    place: 'England',
    minZoom: 6,
    maxZoom: 20,
    extent: siteBoundary.buffedExtents || [ENGLAND_WEST, ENGLAND_SOUTH, ENGLAND_EAST, ENGLAND_NORTH],
    containerHeight: '100%',
    enableMapControls: false,
    enableZoomControls: true
  })
  mapState.attach(interactiveMap)

  attachInteractiveMapToPlugins(interactiveMap)

  interactiveMap.on('app:ready', function (e) {
    interactiveMap.addButton('help', {
      label: 'Help',
      href: '/map-help',
      iconSvgContent: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
      mobile: { slot: 'right-top', showLabel: false, order: 1 },
      tablet: { slot: 'right-top', showLabel: false, order: 1 },
      desktop: { slot: 'right-top', showLabel: false, order: 1 }
    })
  })
})
