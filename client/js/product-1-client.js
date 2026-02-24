import { showMap, convertToImage, doScreenshot } from './static-map.js'
import { getDefraMapConfig } from './map/tokens.js'
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer.js'

import '@arcgis/core/assets.js'
// import '@arcgis/ma'

// @arcgis/core
// /node_modules/@arcgis/core/assets/
// @arcgis/map-components
// /node_modules/@arcgis/map-components/dist/cdn/assets/
// @arcgis/coding-components
// /node_modules/@arcgis/coding-components/dist/cdn/assets/
// @esri/calcite-components
// /node_modules/@esri/calcite-components/dist/calcite/assets/

let layerNameSuffix, agolVectorTileUrl
const consoleLog = console.log
const consoleError = console.error

window.onerror = (a, b, c, d, e) => {
  console.log(`message: ${a}`)
  console.log(`source: ${b}`)
  console.log(`lineno: ${c}`)
  console.log(`colno: ${d}`)
  console.log(`error: ${e}`)
}

const stringify = (message) => {
  let response = ''
  try {
    response += JSON.stringify(message)
    if (message.name) {
      response += ('NAME: ' + JSON.stringify(message.name))
    }
    if (message.message) {
      response += ('MSG: ' + JSON.stringify(message.message))
    }
    if (message.details) {
      response += ('DET: ' + JSON.stringify(message.details))
    }
  } catch (_error) {
    response += ('NS' + message)
  }
  return response
}

const messageLogger = (...messages) => {
  const errorElement = document.getElementById('error')
  messages.forEach((message) => (errorElement.textContent += `, ${stringify(message)}`))
}

console.log = (...messages) => {
  messageLogger('LOG')
  messageLogger(...messages)
  consoleLog(...messages)
}

console.error = (...errors) => {
  messageLogger('ERR')
  messageLogger(...errors)
  consoleError(...errors)
}

const addLayerToMap = (view, layerName) => {
  const url = `${agolVectorTileUrl}/${layerName + layerNameSuffix}/VectorTileServer`
  const vectorTileLayer = new VectorTileLayer({
    id: layerName,
    url,
    opacity: 0.75,
    visible: true
  })
  // vectorTileLayer.
  view.map.layers.add(vectorTileLayer)
  // view.map.add(vectorTileLayer)
  console.log('map.add has been called')
  return view
}

const showMapAsImage = async (polygonArray) => {
  await getDefraMapConfig().then((defraMapConfig) => {
    layerNameSuffix = defraMapConfig.layerNameSuffix
    agolVectorTileUrl = defraMapConfig.agolVectorTileUrl
  })
  let view
  let timeout
  try {
    view = await showMap(polygonArray, true)
      .then((view) => {
        timeout = setTimeout(() => {
          const errorElement = document.getElementById('error')
          errorElement.textContent += ', TIMEOUT HAPPENED -- attempting screenshot'
          // errorElement.id = 'screenshot-image'
          doScreenshot(view)
        }, 10000)
        return view
      })
      .then((view) => addLayerToMap(view, 'Flood_Zones_2_and_3_Rivers_and_Sea'))
      .then(convertToImage)
      .then((view) => {
        clearTimeout(timeout)
        // Destroy the map to free up resources
        view.map.destroy()
        // Remove the map's container element
        document.getElementById('map--result').remove()
      }).catch((error) => {
        const errorElement = document.getElementById('error')
        errorElement.textContent = 'ERROR HAPPENED in Promises: ' + error.message
        errorElement.id = 'screenshot-image'
        console.log(error)
      })
    return view
  } catch (error) {
    const errorElement = document.getElementById('error')
    errorElement.textContent = 'ERROR CAUGHT ' + error.message
    errorElement.id = 'screenshot-image'
    console.log(error)
  }
}
// Add these as globals so they can be called from the html page, which will inject the polygon.
// This approach avoids the need to import this as a module, which limits browser compatibility.
window.showMapAsImage = showMapAsImage
// Also export the methods, so they can be used for unit testing
export { showMapAsImage }
