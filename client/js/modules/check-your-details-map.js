import esriConfig from '@arcgis/core/config.js'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import WMTSLayer from '@arcgis/core/layers/WMTSLayer'
import TileInfo from '@arcgis/core/layers/support/TileInfo'
import Point from '@arcgis/core/geometry/Point'
import Extent from '@arcgis/core/geometry/Extent'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Graphic from '@arcgis/core/Graphic'
import ScaleBar from '@arcgis/core/widgets/ScaleBar'
import { getOsToken, getEsriToken } from '../defra-map/tokens'
import { polygon, centroid, bbox } from '@turf/turf'

const spatialReference = 27700

const buffBoundingBox = (bBox) => {
  const width = bBox[2] - bBox[0]
  const height = bBox[3] - bBox[1]
  const widthBuff = width < 300 ? (320 - width) / 2 : 10
  const heightBuff = height < 240 ? (260 - height) / 2 : 10
  return [
    bBox[0] - widthBuff,
    bBox[1] - heightBuff,
    bBox[2] + widthBuff,
    bBox[3] + heightBuff
  ]
}

const getCentreAndExtents = (polygonArray) => {
  const turfPolygon = polygon([polygonArray])
  const turfCentre = centroid(turfPolygon)
  const turfBBox = buffBoundingBox(bbox(turfPolygon))
  const center = new Point({ x: turfCentre.geometry.coordinates[0], y: turfCentre.geometry.coordinates[1], spatialReference })
  const extent = new Extent({ xmin: turfBBox[0], ymin: turfBBox[1], xmax: turfBBox[2], ymax: turfBBox[3], spatialReference })
  return { center, extent }
}

const showMap = async (polygonArray) => {
  const { token } = await getEsriToken()
  esriConfig.apiKey = token
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
    ui: { components: [] }, // Removes Zoom Buttons and attribution
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

  const scaleBar = new ScaleBar({ view, unit: 'metric', style: 'line' })
  view.ui.add(scaleBar, { position: 'bottom-left' })
  view.ui.padding.bottom = 2 // creates a small gap (rather than the default 14 px) below the scale bar.
  return view
}

// Prevent 2nd p4 submission
document.getElementsByTagName('form')[0].addEventListener('submit', () => {
  document.querySelector('.order-product-four').disabled = true
})
// Re-enable submit button if user navigates back to page
window.addEventListener('pageshow', () => {
  document.querySelector('.order-product-four').disabled = false
})

// Add these as globals so they can be called from the html page, which will inject the polygon.
// This approach avoids the need to import this as a module, which limits browser compatibility.
window.showMap = showMap
// Also export the methods, so they can be used for unit testing
export { showMap }
