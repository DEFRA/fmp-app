const { getOsToken } = require('../services/getOsToken')
const { logDebug } = require('../services/proxyDebug')
const { config } = require('../config')

const OS_API_BASE = 'https://api.os.uk/'

const buildBasemapUri = async (request) => {
  const requestUrl = request?.url?.pathname ? `${request.url.pathname}${request.url.search || ''}` : 'unknown'
  const pathSegment = request.params?.path ? String(request.params.path).replace(/^\/+/, '') : ''
  const pathLooksLikeWmts = /wmts|WMTSCapabilities|GetTile|GetCapabilities/i.test(pathSegment) || request.query?.SERVICE === 'WMTS' || request.query?.REQUEST
  const targetType = pathLooksLikeWmts ? 'wmts' : (request.query?.type || 'vector')

  if (targetType === 'wmts') {
    const wmtsUrl = new URL('/maps/raster/v1/wmts', OS_API_BASE)

    const service = (request.query?.SERVICE || request.query?.service || 'WMTS').toUpperCase()
    const requestName = request.query?.REQUEST || request.query?.request || 'GetCapabilities'
    const version = request.query?.VERSION || request.query?.version || '1.0.0'

    wmtsUrl.searchParams.set('service', service)
    wmtsUrl.searchParams.set('request', requestName)
    wmtsUrl.searchParams.set('version', version)

    Object.entries(request.query || {}).forEach(([key, value]) => {
      const lowerKey = String(key).toLowerCase()

      if (!['type', 'target', 'service', 'request', 'version'].includes(lowerKey)) {
        wmtsUrl.searchParams.set(key, value)
      }
    })

    if (!wmtsUrl.searchParams.has('key')) {
      wmtsUrl.searchParams.set('key', config.ordnanceSurvey.osSearchKey)
    }

    return {
      uri: wmtsUrl.toString(),
      headers: { authorization: `Bearer ${(await getOsToken()).access_token}` }
    }
  }

  const vectorTarget = request.query?.target || '/maps/vector/v1/vts'
  const vectorUrl = new URL(pathSegment ? `${pathSegment}` : vectorTarget, OS_API_BASE)

  Object.entries(request.query || {}).forEach(([key, value]) => {
    if (key !== 'type' && key !== 'target') {
      vectorUrl.searchParams.set(key, value)
    }
  })

  logDebug('os basemap request received', {
    method: request.method,
    requestUrl,
    targetType,
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
