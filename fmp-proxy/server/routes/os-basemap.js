const { getOsToken } = require('../services/getOsToken')
const { logDebug } = require('../services/proxyDebug')
const { config } = require('../config')

const OS_API_BASE = 'https://api.os.uk/'

const buildBasemapUri = async (request) => {
  const requestUrl = `${request.url.pathname}${request.url.search}`
  const pathSegment = String(request.params.path).replace(/^\/+/, '')

  if (pathSegment === 'wmts') {
    const wmtsBasePath = request.query?.target || '/maps/raster/v1/wmts'
    const wmtsUrl = new URL(wmtsBasePath, OS_API_BASE)

    Object.entries(request.query || {}).forEach(([key, value]) => {
      if (key !== 'type' && key !== 'target') {
        wmtsUrl.searchParams.set(key, value)
      }
    })

    if (!wmtsUrl.searchParams.has('key')) {
      wmtsUrl.searchParams.set('key', config.ordnanceSurvey.osSearchKey)
    }

    logDebug('os basemap request received', {
      method: request.method,
      requestUrl,
      upstreamUrl: wmtsUrl.toString()
    })

    return {
      uri: wmtsUrl.toString(),
      headers: { authorization: `Bearer ${(await getOsToken()).access_token}` }
    }
  }

  const vectorTarget = '/maps/vector/v1/vts' // should these be env vars?
  const vectorUrl = new URL(pathSegment ? `${pathSegment}` : vectorTarget, OS_API_BASE)

  Object.entries(request.query).forEach(([key, value]) => {
    if (key !== 'type' && key !== 'target') {
      vectorUrl.searchParams.set(key, value)
    }
  })

  logDebug('os basemap request received', {
    method: request.method,
    requestUrl,
    upstreamUrl: vectorUrl.toString()
  })

  return {
    uri: vectorUrl.toString(),
    headers: { authorization: `Bearer ${(await getOsToken()).access_token}` }
  }
}

module.exports = {
  method: ['GET', 'POST'],
  path: '/proxy/basemap/{path*}',
  options: {
    description: 'Proxy OS basemap requests while keeping the provider path hidden behind the app proxy',
    auth: false,
    handler: {
      proxy: {
        passThrough: true,
        mapUri: buildBasemapUri
      }
    }
  }
}
