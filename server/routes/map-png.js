const { checkParamsForPolygon } = require('../services/shape-utils')
const { makePolygonGeometry } = require('../services/agol')
const { getEAMapsToken } = require('../services/eaMaps/getEAMapsToken')
const { config } = require('../../config')
const axios = require('axios')
const pngBody = require('./pngBody.json')
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept-Encoding': 'gzip, deflate, br'
}
const baseUrl = config.eamaps.serviceUrl

const getFloodZonesStyleUrl = (token) => `${baseUrl}/OS_Outdoor/VectorTileServer/resources/styles/root.json","id":"1910d2c9447-layer-1","title":"OS Outdoor","token":${token}`
const getOutdoorStyleUrl = (token) => `${baseUrl}/OS_Outdoor/VectorTileServer/resources/styles/root.json","id":"1910d2c9447-layer-1","title":"OS Outdoor","token":${token}`

const getTokenForPngService = async () => {
  const fmpToken = await getEAMapsToken()
  console.log('fmpToken', fmpToken)
  const styleUrl = getFloodZonesStyleUrl(fmpToken)
  // const tokenURL = `https://www.arcgis.com/sharing/rest/generateToken?request=getToken&serverUrl=${styleUrl}&token=${fmpToken}&referrer=https//environment.maps.arcgis.com&f=json`
  const tokenURL = `https://www.arcgis.com/sharing/rest/generateToken?request=getToken&serverUrl=${styleUrl}&token=${fmpToken}&f=json`
  const response = await axios.get(tokenURL)
  const { data } = response
  const { token, expires, error } = data
  console.log('token for styleUrl', { token, expires, error })
  return token
}

module.exports = [{
  method: 'GET',
  path: '/map-png',
  options: {
    description: 'Get Product 1 PDF',
    handler: async (request, h) => {
      const { polygon } = checkParamsForPolygon(request.query)
      // https://eaflooddigitalservices.cloud.esriuk.com/server
      // serviceUrl: `https://services1.arcgis.com/${process.env.agolServiceId}/arcgis/rest/services`,
      // vectorTileUrl: `https://tiles.arcgis.com/tiles/${process.env.agolServiceId}/arcgis/rest/services`,

      const pngUrl = 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute'
      // const geometry = JSON.stringify(makePolygonGeometry(polygon))

      const token = await getTokenForPngService()
      const osOutdoorStyleUrl = getOutdoorStyleUrl(token)
      const floodZonesStyleUrl = getFloodZonesStyleUrl(token)

      pngBody.operationalLayers[0].styleUrl = floodZonesStyleUrl
      pngBody.operationalLayers[1].styleUrl = osOutdoorStyleUrl

      const formData = {
        Web_Map_as_JSON: JSON.stringify(pngBody),
        Format: 'PNG32',
        Layout_Template: 'MAP_ONLY',
        Layout_Item_ID: undefined,
        returnZ: false,
        returnM: false,
        returnTrueCurves: false,
        returnFeatureCollection: false,
        returnColumnName: false,
        simplifyFeatures: false,
        context: undefined,
        f: 'pjson'
      }

      const response = await axios.post(pngUrl, formData, { headers: { ...headers, Authorization: token } })
      console.log(response.data.results)
      const pngUrlFromResponse = response.data.results[0].value.url
      console.log('pngUrlFromResponse', pngUrlFromResponse)
      const pngResponse = await axios.get(pngUrlFromResponse, { responseType: 'arraybuffer', headers: { Authorization: token } })
      const pngBuffer = Buffer.from(pngResponse.data, 'binary')
      const image = `data:image/png;base64,${pngBuffer.toString('base64')}`
      console.log('image', image)
      return h.view('map-png', { polygon, image })
    }
  }
}]
