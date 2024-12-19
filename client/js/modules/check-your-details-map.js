import esriConfig from '@arcgis/core/config.js'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import WMTSLayer from '@arcgis/core/layers/WMTSLayer'
import TileInfo from '@arcgis/core/layers/support/TileInfo'
import Point from '@arcgis/core/geometry/Point'
import Extent from '@arcgis/core/geometry/Extent'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Graphic from '@arcgis/core/Graphic'
import { polygon, centroid, bbox } from '@turf/turf'

const spatialReference = 27700

const setUpIgnoreRepeatedSubmits = () => {
  const form = document.getElementsByTagName('form')[0]
  const submitButton = document.querySelector('.order-product-four')
  // FCRM-4556 - Prevent a 2nd Submission
  form.addEventListener('submit', function (evt) {
    if (submitButton.classList.contains('govuk-button--disabled')) {
      evt.preventDefault()
    } else {
      submitButton.classList.add('govuk-button--disabled')
    }
  })
}

// TODO - import these from tokens.js
const esriAuth = {}
const getEsriToken = async () => {
  const response = await window.fetch('/esri-token')
  const json = await response.json()
  return json.token
}

const osAuth = {}
const getOsToken = async () => {
  // Check token is valid
  const isExpired = !Object.keys(osAuth).length || Date.now() >= osAuth?.expiresAt
  if (isExpired) {
    try {
      const response = await window.fetch('/os-token', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const json = await response.json()
      osAuth.token = json.access_token
      osAuth.expiresAt = Date.now() + ((json.expires_in - 30) * 1000)
    } catch (err) {
      console.log('Error getting OS access token: ', err)
    }
  }
  return osAuth
}

const getCentreAndExtents = (polygonArray) => {
  const turfPolygon = polygon([polygonArray])
  const turfCentre = centroid(turfPolygon)
  const turfBBox = bbox(turfPolygon)
  // const bBoxPolygon = bboxPolygon(bBox)
  const center = new Point({ x: turfCentre.geometry.coordinates[0], y: turfCentre.geometry.coordinates[1], spatialReference })
  const extent = new Extent({ xmin: turfBBox[0], ymin: turfBBox[1], xmax: turfBBox[2], ymax: turfBBox[3], spatialReference })
  return { center, extent }
}

const showMap = async (polygonArray) => {
  esriAuth.token = await getEsriToken()
  esriConfig.apiKey = esriAuth.token
  esriConfig.request.interceptors.push({
    urls: 'https://api.os.uk/maps/raster/v1/wmts',
    before: async params => {
      const token = (await getOsToken()).token
      params.requestOptions.headers = {
        Authorization: 'Bearer ' + token
      }
    }
  })

  // TODO get this url from config
  const baseMapLayer = new WMTSLayer({
    url: 'https://api.os.uk/maps/raster/v1/wmts',
    serviceMode: 'KVP',
    activeLayer: {
      id: 'Outdoor_27700'
    }
  })

  const graphicsLayer = new GraphicsLayer()

  const myMap = new Map({
    layers: [baseMapLayer, graphicsLayer]
  })

  const polygonGraphic = new Graphic({
    geometry: {
      type: 'polygon',
      rings: [polygonArray],
      symbol: {
        type: 'simple-line',
        color: '#d4351c',
        width: '2px',
        cap: 'square'
      },
      spatialReference
    }
  })
  graphicsLayer.add(polygonGraphic)
  polygonGraphic.symbol = {
    type: 'simple-line', // autocasts as new SimpleLineSymbol()
    color: '#d4351c',
    width: '3px',
    style: 'solid'
  }

  const { center, extent } = getCentreAndExtents(polygonArray)

  const view = new MapView({
    map: myMap,
    container: 'map',
    spatialReference,
    center,
    extent,
    ui: {
      components: []
    },
    navigation: {
      mouseWheelZoomEnabled: false,
      browserTouchPanEnabled: false
    },
    constraints: {
      snapToZoom: false,
      minZoom: 6,
      maxZoom: 20,
      lods: TileInfo.create({ spatialReference: { wkid: spatialReference } }).lods,
      rotationEnabled: false
    }
  })
  // Disable Zoom in its many forms.
  view.on('key-down', (event) => event.stopPropagation())
  view.on('drag', (event) => event.stopPropagation())
  view.on('drag', ['Shift'], (event) => event.stopPropagation())
  view.on('drag', ['Shift', 'Control'], (event) => event.stopPropagation())
  view.on('double-click', (event) => event.stopPropagation())
  view.on('double-click', ['Control'], (event) => event.stopPropagation())

  return view
}

// Add these as globals so they can be called from the html page, which will inject the polygon.
// This approach avoids the need to import this as a module, which limits browser compatibility.
window.setUpIgnoreRepeatedSubmits = setUpIgnoreRepeatedSubmits
window.showMap = showMap
// Also export the methods, so they can be used for unit testing
export { setUpIgnoreRepeatedSubmits, showMap }
