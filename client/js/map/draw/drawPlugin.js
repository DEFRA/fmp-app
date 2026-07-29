import createDrawPlugin from '@defra/interactive-map/plugins/draw-es'
import createFramePlugin from '@defra/interactive-map/plugins/frame'
import { hideHelpPanel, showHelpPanel } from '../helpBanner.js'

export const drawPlugin = createDrawPlugin({
  onGeometryChange: (geometry) => true
})

export const framePlugin = createFramePlugin({
  aspectRatio: 1.5
})

const boundary = {
  id: 'boundary',
  view: null,
  state: 'empty', // possible states: 'empty', 'editing', 'complete'
  feature: null,
  frameMaxZoom: 22,
  maxZoom: 20,
  type: null // possible types: 'polygon', 'square'
}

export const attachDrawPlugin = (interactiveMap) => {
  const updateDrawState = (newState, feature, type) => {
    boundary.state = newState
    boundary.type = type || boundary.type
    boundary.feature = feature
    const drawing = newState === 'editing'
    interactiveMap.toggleButtonState('geometryActions', 'hidden', drawing)

    if (!drawing) {
      if (boundary?.view?.constraints) {
        boundary.view.constraints.maxZoom = boundary.maxZoom
      }
      showHelpPanel()
      interactiveMap.showPanel('datasetsLayers')

      interactiveMap.toggleButtonState('editShape', 'disabled', boundary.state !== 'complete')
      interactiveMap.toggleButtonState('deleteShape', 'disabled', boundary.state !== 'complete')
      interactiveMap.toggleButtonState('addPolygon', 'disabled', boundary.state === 'complete')
      interactiveMap.toggleButtonState('addSquare', 'disabled', boundary.state === 'complete')
    } else {
      if (boundary.type === 'square' && boundary?.view?.constraints) {
        // Zoom in to avoid huge frames being requested by default
        boundary.view.constraints.maxZoom = boundary.frameMaxZoom
        boundary.view.goTo({ center: boundary.view.center, zoom: boundary.frameMaxZoom, duration: 200 })
      }

      hideHelpPanel()
      interactiveMap.hidePanel('datasetsLayers')
    }
    boundary.feature = feature
  }

  const onCancelEditing = () => updateDrawState(boundary.feature ? 'complete' : 'empty', boundary.feature, boundary.type)

  interactiveMap.on('map:ready', function ({ view }) {
    boundary.view = view
    boundary.maxZoom = boundary.view?.constraints?.maxZoom || 20

    interactiveMap.addButton('geometryActions', {
      label: 'Get data for your location',
      mobile: { slot: 'bottom-right', order: 4 },
      tablet: { slot: 'top-left', order: 4 },
      desktop: { slot: 'top-left', order: 4 },
      menuItems: [{
        id: 'addPolygon',
        label: 'Add polygon',
        iconSvgContent: '<path d="M19.5 7v10M4.5 7v10M7 19.5h10M7 4.5h10"/><path d="M22 18v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zm0-15v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zM7 18v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zM7 3v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1z"/>',
        onClick: function (e) {
          drawPlugin.newPolygon(boundary.id)
          updateDrawState('editing', boundary.feature, 'polygon')
        }
      }, {
        id: 'addSquare',
        label: 'Add square',
        iconSvgContent: '<rect width="18" height="18" x="3" y="3" rx="2"/>',
        onClick: function (e) {
          framePlugin.addFrame('boundary', { aspectRatio: 1 })
          updateDrawState('editing', boundary.feature, 'square')
        }
      },
      {
        id: 'editShape',
        label: 'Edit feature',
        iconSvgContent: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
        isDisabled: true,
        onClick: function () {
          if (boundary.type === 'square') {
            drawPlugin.deleteFeature('boundary')
            framePlugin.editFeature(boundary.feature)
          } else {
            drawPlugin.editFeature(boundary.id)
          }
          updateDrawState('editing', boundary.feature, boundary.type)
        }
      },
      {
        id: 'deleteShape',
        label: 'Delete shape',
        iconSvgContent: '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
        isDisabled: true,
        onClick: () => {
          drawPlugin.deleteFeature(boundary.id)
          updateDrawState('empty')
        }
      }
      ]
    })
  })

  interactiveMap.on('draw:done', function ({ newFeature: feature }) {
    updateDrawState('complete', feature, 'polygon')
  })

  interactiveMap.on('draw:updated', function (feature) {
    console.log('draw:updated', feature)
  })

  interactiveMap.on('draw:created', function (feature) {
    console.log('draw:created', feature)
  })

  interactiveMap.on('draw:cancelled', onCancelEditing)
  interactiveMap.on('frame:cancel', () => {
    if (boundary.feature) {
      drawPlugin.addFeature(boundary.feature) // Add back the existing feature
    }
    onCancelEditing()
  })

  interactiveMap.on('draw:deleted', function (feature) {
    updateDrawState('empty')
  })

  interactiveMap.on('frame:done', function (feature) {
    console.log('frame:done', feature)
    drawPlugin.addFeature(feature)
    updateDrawState('complete', feature, 'square')
  })
}
