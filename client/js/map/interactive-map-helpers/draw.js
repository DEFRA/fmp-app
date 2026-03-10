import createDrawPlugin from '@defra/interactive-map/plugins/draw-es'
import createFramePlugin from '@defra/interactive-map/plugins/frame'
import { hideMenu, addMenuClickHandlers, toggleButtonState } from './menu.js'
import { getGeometryShape } from './utils.js'

export const drawPlugin = createDrawPlugin({
  onGeometryChange: (geometry) => true
})

export const framePlugin = createFramePlugin({
  aspectRatio: 1.5
})

let feature

const logFeature = () => {
  console.log('Polygon is:', !feature ? 'undefined' : '')
  if (feature) {
    console.log(JSON.stringify(feature?.geometry?.coordinates?.[0], { depth: null }))
  }
}

export const attachDrawPluginHandlers = (interactiveMap) => {
  interactiveMap.on('draw:ready', function () {
    // Add a feature if provided
    if (feature) {
      drawPlugin.addFeature(feature)
    }

    // Add menu click handlers
    addMenuClickHandlers({
      onDrawShape: function () {
        drawPlugin.newPolygon('boundary', {
          onGeometryChange: (geometry) => true
        })
        hideMenu(interactiveMap)
      },
      onDrawFrame: function () {
        framePlugin.addFrame('boundary', {
          aspectRatio: 1
        })
        hideMenu(interactiveMap)
      },
      onEdit: function () {
        if (getGeometryShape(feature.geometry) === 'square') {
          drawPlugin.deleteFeature('boundary')
          framePlugin.editFeature(feature)
        } else {
          drawPlugin.editFeature('boundary', {
            onGeometryChange: (geometry) => true
          })
        }
        hideMenu(interactiveMap)
      },
      onDelete: function () {
        drawPlugin.deleteFeature('boundary')
        feature = null
        hideMenu(interactiveMap)
      }
    })
  })

  interactiveMap.on('draw:done', function (e) {
    feature = e.newFeature
    console.log('draw:done')
    logFeature()
    toggleButtonState(['edit', 'delete'])
  })

  interactiveMap.on('draw:updated', function (e) {
    console.log('draw:updated', e)
    logFeature()
  })

  interactiveMap.on('draw:created', function (e) {
    console.log('draw:created', e)
    logFeature()
  })

  interactiveMap.on('draw:cancelled', function (e) {
    console.log('draw:cancelled', e)
    logFeature()
    toggleButtonState(feature ? ['edit', 'delete'] : ['shape', 'square'])
  })

  interactiveMap.on('draw:deleted', function (e) {
    console.log('draw:deleted', e)
    logFeature()
  })

  interactiveMap.on('frame:done', function (e) {
    console.log('frame:done', e)
    drawPlugin.addFeature(e)
    feature = e
    logFeature()
    toggleButtonState(['edit', 'delete'])
  })

  interactiveMap.on('frame:cancel', function () {
    if (feature) {
      drawPlugin.addFeature(feature)
    }
    logFeature()
    toggleButtonState(feature ? ['edit', 'delete'] : ['shape', 'square'])
  })
}
