import { esriStatusCodes } from '../../../server/constants'
const osAuth = {}
const esriAuth = {}
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

export const getInterceptors = () => {
  return [{
    urls: 'https://api.os.uk/maps/vector/v1/vts',
    before: async params => {
      const token = (await getOsToken()).token
      params.requestOptions.headers = {
        Authorization: 'Bearer ' + token
      }
    }
  }, {
    urls: 'https://tiles.arcgis.com/tiles',
    error: async (error) => {
      if (isInvalidTokenError(error)) {
        console.log('refreshing esri token')
        await refreshEsriToken()
      }
    }
  }]
}

// All other requests can be asyncronous and return a request object itself
export const getRequest = async (url) => {
  let options = {}

  // OS Open Names
  if (url.startsWith('https://api.os.uk')) {
    const token = (await getOsToken()).token
    options = { headers: { Authorization: 'Bearer ' + token } }
  }

  // ESRI World Geocoder
  if (url.startsWith('https://geocode-api.arcgis.com')) {
    const token = (await getEsriToken()).token
    url = `${url}&token=${token}`
  }

  return new window.Request(url, options)
}

export const getEsriToken = async (refresh = false) => {
  const hasToken = esriAuth.token

  if (refresh || !hasToken) {
    try {
      const queryString = refresh ? '?refresh=true' : ''
      const response = await window.fetch(`/esri-token${queryString}`)
      const json = await response.json()
      Object.assign(esriAuth, json)
    } catch (err) {
      console.log('Error getting ESRI access token: ', err)
    }
  }

  return esriAuth
}

let defraMapConfig

export const getDefraMapConfig = async () => {
  if (defraMapConfig === undefined) {
    const response = await window.fetch('/defra-map/config')
    defraMapConfig = await response.json()
  }
  return defraMapConfig
}

let _esriConfig
export const setEsriConfig = (esriConfig) => (_esriConfig = esriConfig)

const refreshEsriToken = async () => {
  if (_esriConfig) {
    const { token } = await getEsriToken(true) // forceRefresh = true
    _esriConfig.apiKey = token
  }
}

export const isInvalidTokenError = (error) => (error?.details?.httpStatus === esriStatusCodes.INVALID_TOKEN_CODE)
