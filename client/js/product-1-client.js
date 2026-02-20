import { showMap, convertToImage } from './static-map.js'

const showMapAsImage = async (polygonArray) => {
  return showMap(polygonArray)
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
