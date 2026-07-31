import createDrawPlugin from '@defra/interactive-map/plugins/draw-es'
import createFramePlugin from '@defra/interactive-map/plugins/frame'
import { hideHelpPanel, showHelpPanel } from '../helpBanner.js'
import { PolygonFeature, polygonFeature } from '../interactive-map-helpers/polygonFeature.js'
import { terms } from '..//terms.js'

export const drawPlugin = createDrawPlugin()

export const framePlugin = createFramePlugin()

const attachUpdateDraw = (interactiveMap) => () => {
  const { isEditing, isComplete, isSquare } = polygonFeature
  interactiveMap.toggleButtonState('geometryActions', 'hidden', isEditing)
  interactiveMap.toggleButtonState('uploadShape', 'disabled', !polygonFeature.isEmpty)

  if (isEditing) {
    interactiveMap.removeMarker('search')
    if (isSquare) {
      polygonFeature.zoomOnSquare() // Zoom in to avoid huge frames being requested by default
    }
    hideHelpPanel()
    interactiveMap.hidePanel('datasetsLayers')
  } else {
    polygonFeature.resetZoom()
    showHelpPanel()
    interactiveMap.showPanel('datasetsLayers')
    interactiveMap.toggleButtonState('editShape', 'disabled', !isComplete)
    interactiveMap.toggleButtonState('deleteShape', 'disabled', !isComplete)
    interactiveMap.toggleButtonState('addPolygon', 'disabled', isComplete)
    interactiveMap.toggleButtonState('addSquare', 'disabled', isComplete)
  }
}

const menuItems = {
  addPolygon: {
    id: 'addPolygon',
    label: terms.labels.addPolygon,
    iconSvgContent: '<path d="M19.5 7v10M4.5 7v10M7 19.5h10M7 4.5h10"/><path d="M22 18v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zm0-15v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zM7 18v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zM7 3v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1z"/>'
  },
  addSquare: {
    id: 'addSquare',
    label: terms.labels.addSquare,
    iconSvgContent: '<rect width="18" height="18" x="3" y="3" rx="2"/>'
  },
  uploadShape: {
    id: 'uploadShape',
    label: terms.labels.uploadShape,
    iconSvgContent: '<line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="7,8 12,3 17,8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="5,17 5,19 19,19 19,17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    onClick: () => (globalThis.location.href = '/upload')
  },
  editShape: {
    id: 'editShape',
    label: terms.labels.editShape,
    iconSvgContent: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    isDisabled: true
  },
  deleteShape: {
    id: 'deleteShape',
    label: terms.labels.deleteShape,
    iconSvgContent: '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    isDisabled: true
  }
}

export const attachDrawPlugin = (interactiveMap) => {
  const updateDrawState = attachUpdateDraw(interactiveMap)
  const onCancelEditing = () => {
    polygonFeature.state = polygonFeature.feature ? PolygonFeature.COMPLETE : PolygonFeature.EMPTY
    updateDrawState()
  }

  interactiveMap.on('map:ready', function ({ view }) {
    polygonFeature.mapView = view

    interactiveMap.addButton('geometryActions', {
      label: terms.labels.drawMenuTitle,
      mobile: { slot: 'bottom-right', order: 4 },
      tablet: { slot: 'top-left', order: 4 },
      desktop: { slot: 'top-left', order: 4 },
      menuItems: [{
        ...menuItems.addPolygon,
        onClick: () => {
          drawPlugin.newPolygon(polygonFeature.id)
          polygonFeature.state = PolygonFeature.EDITING
          polygonFeature.type = PolygonFeature.POLYGON
          updateDrawState()
        }
      }, {
        ...menuItems.addSquare,
        onClick: () => {
          framePlugin.addFrame(polygonFeature.id, { aspectRatio: 1 })
          polygonFeature.state = PolygonFeature.EDITING
          polygonFeature.type = PolygonFeature.SQUARE
          updateDrawState()
        }
      },
      {
        ...menuItems.uploadShape,
        onClick: () => (globalThis.location.href = '/upload')
      },
      {
        ...menuItems.editShape,
        onClick: () => {
          if (polygonFeature.isSquare) {
            drawPlugin.deleteFeature(polygonFeature.id)
            framePlugin.editFeature(polygonFeature.feature)
          } else {
            drawPlugin.editFeature(polygonFeature.id)
          }
          polygonFeature.state = PolygonFeature.EDITING
          updateDrawState()
        }
      },
      {
        ...menuItems.deleteShape,
        onClick: () => {
          drawPlugin.deleteFeature(polygonFeature.id)
          polygonFeature.feature = null
          updateDrawState()
        }
      }
      ]
    })
  })

  interactiveMap.on('draw:ready', function () {
    updateDrawState()
    if (polygonFeature.feature) {
      drawPlugin.addFeature(polygonFeature.feature)
    }
  })

  interactiveMap.on('draw:done', function ({ newFeature: feature }) {
    polygonFeature.feature = feature
    polygonFeature.type = PolygonFeature.POLYGON
    updateDrawState()
  })

  interactiveMap.on('draw:updated', function (feature) {
    console.log('draw:updated', feature)
    // check the size here and warn the user if it is too big
  })

  // I don't think we need this event, but left in so we know it is available
  // It is fired when the user completes a polygon, but hasn't yet clicked the "Done" button
  // interactiveMap.on('draw:created', (feature) => console.log('draw:created', feature))

  interactiveMap.on('draw:cancelled', onCancelEditing)
  interactiveMap.on('frame:cancel', () => {
    if (polygonFeature.feature) {
      drawPlugin.addFeature(polygonFeature.feature) // Add back the existing feature
    }
    onCancelEditing()
  })

  interactiveMap.on('draw:deleted', function (feature) {
    polygonFeature.feature = null
    updateDrawState()
  })

  interactiveMap.on('frame:done', function (feature) {
    drawPlugin.addFeature(feature)
    polygonFeature.feature = feature
    polygonFeature.type = PolygonFeature.SQUARE
    updateDrawState()
  })
}
