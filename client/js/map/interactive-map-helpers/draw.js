import createDrawPlugin from '@defra/interactive-map/plugins/draw-es'
import createFramePlugin from '@defra/interactive-map/plugins/frame'
import { hideMenu, addMenuClickHandlers, toggleButtonState } from './menu.js'
import { getGeometryShape } from './utils.js'
import { polygonFeature } from './polygonFeature.js'
import { hideAllLayers, showActiveLayers } from '../mapLayers/index.js'
import { hideAllFeatureLayers, showActiveFeatureLayers } from '../mapLayers/featureLayers/featureLayers.js'

export const drawPlugin = createDrawPlugin({
  onGeometryChange: (geometry) => true
})

export const framePlugin = createFramePlugin({
  aspectRatio: 1.5
})

export const attachDrawPluginHandlers = (interactiveMap) => {
  const showHideGetSummary = (forceHide = false) => {
    const hidden = forceHide || !polygonFeature.coordinates
    interactiveMap.toggleButtonState('get-summary', 'hidden', hidden)
  }

  const onEditCreateShape = () => {
    hideMenu(interactiveMap)
    showHideGetSummary(true) // forceHide
    hideAllLayers()
    hideAllFeatureLayers()
  }

  interactiveMap.on('draw:ready', function () {
    // Add a feature if provided
    if (polygonFeature.feature) {
      drawPlugin.addFeature(polygonFeature.feature)
      toggleButtonState(polygonFeature.feature ? ['edit', 'delete'] : ['shape', 'square'])
    }
    interactiveMap.addButton('get-summary', {
      label: 'Get summary report',
      variant: 'primary',
      onClick: (event, context) => {
        window.location = `/results?encodedPolygon=${polygonFeature.encodedPolygon}`
      },
      mobile: { slot: 'actions', showLabel: true },
      tablet: { slot: 'actions', showLabel: true },
      desktop: { slot: 'actions', showLabel: true },
    })
    showHideGetSummary()

    // Add menu click handlers
    addMenuClickHandlers({
      onDrawShape: function () {
        drawPlugin.newPolygon('boundary', {
          onGeometryChange: (geometry) => true
        })
        onEditCreateShape()
      },
      onDrawFrame: function () {
        framePlugin.addFrame('boundary', {
          aspectRatio: 1
        })
        onEditCreateShape()
      },
      onEdit: function () {
        if (getGeometryShape(polygonFeature.feature.geometry) === 'square') {
          drawPlugin.deleteFeature('boundary')
          framePlugin.editFeature(polygonFeature.feature)
        } else {
          drawPlugin.editFeature('boundary', {
            onGeometryChange: (geometry) => true
          })
        }
        onEditCreateShape()
      },
      onDelete: function () {
        drawPlugin.deleteFeature('boundary')
        polygonFeature.feature = null
        showHideGetSummary()
        hideMenu(interactiveMap)
        showHideGetSummary(true) // forceHide
        showActiveLayers()
        showActiveFeatureLayers()
      }
    })
  })

  interactiveMap.on('draw:done', function ({ newFeature: feature }) {
    polygonFeature.feature = feature
    showHideGetSummary()
    console.log('draw:done')
    toggleButtonState(['edit', 'delete'])
    showActiveLayers()
    showActiveFeatureLayers()
  })

  interactiveMap.on('draw:updated', function (feature) {
    console.log('draw:updated', feature)
  })

  interactiveMap.on('draw:created', function (feature) {
    console.log('draw:created', feature)
  })

  interactiveMap.on('draw:cancelled', function (feature) {
    console.log('draw:cancelled', feature)
    toggleButtonState(polygonFeature.feature ? ['edit', 'delete'] : ['shape', 'square'])
    showHideGetSummary()
    showActiveLayers()
    showActiveFeatureLayers()
  })

  interactiveMap.on('draw:deleted', function (feature) {
    console.log('draw:deleted', feature)
  })

  interactiveMap.on('frame:done', function (feature) {
    console.log('frame:done', feature)
    drawPlugin.addFeature(feature)
    polygonFeature.feature = feature
    showHideGetSummary()
    toggleButtonState(['edit', 'delete'])
    showActiveLayers()
    showActiveFeatureLayers()
  })

  interactiveMap.on('frame:cancel', function () {
    if (polygonFeature.feature) {
      drawPlugin.addFeature(polygonFeature.feature)
    }
    showHideGetSummary()
    toggleButtonState(polygonFeature.feature ? ['edit', 'delete'] : ['shape', 'square'])
    showActiveLayers()
    showActiveFeatureLayers()
  })
}
