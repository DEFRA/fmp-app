import createInteractPlugin from '@defra/interactive-map/plugins/interact'
import { terms } from '../terms.js'
import { mapState } from './mapState.js'
import { getInfoPanel } from '../infoPanel.js'

let enableGetInfoButton = false
let oldCenter = null

const initiateTriggerHitTest = (interactiveMap) => async (center) => {
  if (!center) { // So we can pass in null to force a hit test to be triggered when the datasets are ready
    if (!oldCenter) {
      return
    }
    center = oldCenter
    oldCenter = null
  }
  if (oldCenter && oldCenter[0] === center[0] && oldCenter[1] === center[1]) {
    return // avoid triggering a hit test if the center hasn't changed
  }
  oldCenter = center
  const screenPoint = await mapState.view.toScreen({ x: center[0], y: center[1] })
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
        // TODO: Once the im provides an api that returns the interfaceType and center
        // emits an event when the interfaceType changes, we can use that in the reactiveUtils listener
        // and get rid of this enableWhen event all together.

        // Save the interfaceType in our local mapState
        mapState.interfaceType = event?.appState?.interfaceType || 'mouse'
        if (mapState.interfaceType !== 'touch') {
          return false
        }
        const { mapState: imMapState } = event
        const { center } = imMapState
        if (center && interactPlugin.triggerHitTest) {
          interactPlugin.triggerHitTest(center)
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
