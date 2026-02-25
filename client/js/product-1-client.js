import { showMap, convertToImage, doScreenshot } from './static-map.js'
import { getDefraMapConfig } from './map/tokens.js'
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer.js'
import axios from 'axios'
import '@arcgis/core/assets.js'

let layerNameSuffix, agolVectorTileUrl

const addLayerToMap = (view, layerName) => {
  const url = `${agolVectorTileUrl}/${layerName + layerNameSuffix}/VectorTileServer`
  const vectorTileLayer = new VectorTileLayer({
    id: layerName,
    url,
    opacity: 0.75,
    visible: true
  })
  view.map.layers.add(vectorTileLayer)
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

const getPdf = async () => {
  const html = getHtmlForConversion()
  const applicationCss = await getCss('application.css')
  const checkYourDetailsCss = await getCss('check-your-details.css')
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  const formData = new FormData()
  formData.append('files[]', new File([html], 'index.html', { type: 'text/html' }))
  formData.append('files[]', new File([applicationCss], 'application.css', { type: 'text/css' }))
  formData.append('files[]', new File([checkYourDetailsCss], 'check-your-details.css', { type: 'text/css' }))
  const gotenburgUrl = '/gotenburg'
  doAxiosPost(gotenburgUrl, formData, headers)
}

const doAxiosPost = async (gotenburgUrl, formData, headers) => {
  await axios.post(gotenburgUrl, formData, { responseType: 'blob' })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'file.pdf')
      document.body.appendChild(link)
      link.click()
    }).catch((error) => {
      console.log(error.message)
    })
}

const getHtmlForConversion = () => {
  const clone = document.getElementsByTagName('html')[0].cloneNode(true)
  Array.from(clone.getElementsByTagName('script')).forEach((element) => element.remove())
  Array.from(clone.getElementsByTagName('link')).filter((element) => {
    if (element.getAttribute('rel') !== 'stylesheet') {
      return true
    }
    if (element.getAttribute('href')?.match('node_modules')) {
      return true
    }
    // Gotenburg requires all files to be at root level, so remove /assets/ from the paths
    element.setAttribute('href', element.getAttribute('href').replace('/assets/', ''))
    return false
  }).forEach((element) => element.remove())
  return clone.outerHTML
}

const getCss = async (cssFilename) => {
  const response = await globalThis.fetch(`/assets/${cssFilename}`, { method: 'GET', cache: 'force-cache' })
  const contents = await response.text()
  return contents
}

// Add these as globals so they can be called from the html page, which will inject the polygon.
// This approach avoids the need to import this as a module, which limits browser compatibility.
window.getPdf = getPdf
window.showMapAsImage = showMapAsImage
// Also export the methods, so they can be used for unit testing
export { showMapAsImage, getPdf }
