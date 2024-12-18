import esriConfig from '@arcgis/core/config.js'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import WMTSLayer from '@arcgis/core/layers/WMTSLayer'
import TileInfo from '@arcgis/core/layers/support/TileInfo'
import Point from '@arcgis/core/geometry/Point'

const esriAuth = {}

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

const getEsriToken = async () => {
  const response = await window.fetch('/esri-token')
  const json = await response.json()
  return json.token
}

const osAuth = {}
export const getOsToken = async () => {
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

document.addEventListener('DOMContentLoaded', async () => {
  setUpIgnoreRepeatedSubmits()
  esriAuth.token = await getEsriToken()
  // console.log('token', esriAuth.token)
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
  console.log('esriConfig', esriConfig)

  const baseMapLayer = new WMTSLayer({
    url: 'https://api.os.uk/maps/raster/v1/wmts',
    serviceMode: 'KVP',
    activeLayer: {
      id: 'Outdoor_27700'
    }
  })

  const myMap = new Map({
    layers: [baseMapLayer],
    logo: false
  })

  const centre = [465687, 451375]
  // const centre = [231062, 72358]
  const centrePoint = new Point({ x: centre[0], y: centre[1], spatialReference: 27700 })
  console.log('centrePoint', centrePoint)
  const view = new MapView({
    map: myMap,
    logo: false,
    container: 'map',
    spatialReference: 27700,
    zoom: 7.7,
    center: centrePoint,
    constraints: {
      snapToZoom: true,
      minZoom: 6,
      maxZoom: 20,
      //      maxScale: 0,
      lods: TileInfo.create({ spatialReference: { wkid: 27700 } }).lods,
      rotationEnabled: false
    }
  })
  console.log('view', view)
  // document.getElementById('map--result').innerText = 'MAP GOES HERE!'
})
