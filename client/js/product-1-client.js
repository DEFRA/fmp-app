import { showMap, convertToImage } from './static-map.js'
import { getDefraMapConfig } from './map/tokens.js'
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer.js'

let layerNameSuffix, agolVectorTileUrl

const addLayerToMap = (view, layerName) => {
  const url = `${agolVectorTileUrl}/${layerName + layerNameSuffix}/VectorTileServer`
  const vectorTileLayer = new VectorTileLayer({
    id: layerName,
    url,
    opacity: 0.75,
    visible: true
  })
  view.map.add(vectorTileLayer)
  return view
}

const showMapAsImage = async (polygonArray) => {
  await getDefraMapConfig().then((defraMapConfig) => {
    layerNameSuffix = defraMapConfig.layerNameSuffix
    agolVectorTileUrl = defraMapConfig.agolVectorTileUrl
  })
  console.log(layerNameSuffix)
  return showMap(polygonArray)
    .then((view) => addLayerToMap(view, 'Flood_Zones_2_and_3_Rivers_and_Sea'))
    .then(convertToImage)
    .then((view) => {
      // Destroy the map to free up resources
      view.map.destroy()
      // Remove the map's container element
      document.getElementById('map--result').remove()
    })
}
// Add these as globals so they can be called from the html page, which will inject the polygon.
// This approach avoids the need to import this as a module, which limits browser compatibility.
window.showMapAsImage = showMapAsImage
// Also export the methods, so they can be used for unit testing
export { showMapAsImage }
