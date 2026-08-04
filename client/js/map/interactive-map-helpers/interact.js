import createInteractPlugin from '@defra/interactive-map/plugins/interact'
import { terms } from '../terms.js'
import { mapState } from './mapState.js'
import { getInfoPanel } from '../infoPanel.js'

let enableGetInfoButton = false

const initiateTriggerHitTest = (interactiveMap) => async () => {
  const screenPoint = await mapState.view.toScreen(mapState.view.center)
  mapState.updateVisibleLayers()
  await mapState.view.hitTest(screenPoint, { include: mapState.visibleLayers }).then(mapState.assignCursorStyleLayer)
  enableGetInfoButton = Boolean(mapState.cursorStyleLayer)

  interactiveMap.toggleButtonState('selectAtTarget', 'disabled', enableGetInfoButton)
}

export const interactPlugin = createInteractPlugin({
  manifest: {
    buttons: [{
      id: 'selectAtTarget',
      label: terms.labels.getInfo,
      enableWhen: (event) => {
        // TODO: Once the im provides an api that returns the interfaceType
        // or emits an event when the interfaceType changes, we can use that in the reactiveUtils listener
        // and get rid of this enableWhen event all together.

        // Save the interfaceType in our local mapState
        mapState.interfaceType = event?.appState?.interfaceType || 'mouse'
        if (mapState.interfaceType !== 'touch') {
          return false
        }
        return enableGetInfoButton
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

  interactPlugin.triggerHitTest = initiateTriggerHitTest(interactiveMap)

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
