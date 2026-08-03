import createInteractPlugin from '@defra/interactive-map/plugins/interact'
import { terms } from '../terms.js'
import { mapState } from './mapState.js'
import { getInfoPanel } from '../infoPanel.js'

export const interactPlugin = createInteractPlugin({
  manifest: {
    buttons: [{
      id: 'selectAtTarget',
      label: terms.labels.getInfo,
      enableWhen: (event) => {
        const { appState } = event
        // Save the interfaceType in our local mapState - so we can use it in the map:moveend event to determine if we should do a hitTest
        mapState.interfaceType = appState?.interfaceType
        return (mapState.interfaceType === 'touch' && !(appState.disabledButtons['selectAtTarget']))
      }
    }]
  },
  marker: {
    id: 'infoPanelMarker',
    symbol: 'pin',
    backgroundColor: { outdoor: '#0b0c0c', dark: '#ffffff' },
    foregroundColor: { outdoor: '#ffffff', dark: '#0b0c0c' }
  },
  interactionModes: ['placeMarker'], // e.g. ['selectMarker'], ['selectFeature'], ['placeMarker'], or combinations
})

export const attachInteractPlugin = (interactiveMap) => {
  interactiveMap.on('map:ready', function (e) {
    interactPlugin.enable()
  })

  interactiveMap.on('map:moveend', async (event) => {
    if (mapState.interfaceType !== 'touch') {
      return
    }
    const { center } = event
    const screenPoint = await mapState.view.toScreen({ x: center[0], y: center[1] })
    mapState.updateVisibleLayers()
    await mapState.view.hitTest(screenPoint, { include: mapState.visibleLayers }).then(mapState.assignCursorStyleLayer)
    interactiveMap.toggleButtonState('selectAtTarget', 'disabled', !mapState.cursorStyleLayer)
  })

  interactiveMap.on('interact:markerchange', async (event) => {
    const { coords } = event
    const screenPoint = await mapState.view.toScreen({ x: coords[0], y: coords[1] })
    mapState.updateVisibleLayers()
    await mapState.view.hitTest(screenPoint, { include: mapState.visibleLayers }).then(mapState.assignCursorStyleLayer)

    if (mapState.cursorStyleLayer) {
      const attributes = mapState.cursorAttributes
      const infoPanelValues = {
        ...mapState.getInfoPanelDataForEsriStyleLayerId(mapState.cursorStyleLayer),
        coords: `${Math.round(event.coords[0])},${Math.round(event.coords[1])}`,
        version: mapState.defraMapConfig.version
      }
      if (attributes?.flood_source) {
        infoPanelValues.fs = attributes.flood_source
      }
      const infoPanel = await getInfoPanel(infoPanelValues)
      const { width, label, html } = infoPanel
      interactiveMap.addPanel('info', {
        label,
        html,
        mobile: { slot: 'drawer', modal: true, open: true },
        tablet: { slot: 'left-top', width, open: true },
        desktop: { slot: 'left-top', width, open: true }
      })
    } else {
      interactiveMap.removeMarker('infoPanelMarker')
      interactiveMap.removePanel('info')
    }
  })
}
