const { getOsToken } = require('../services/getOsToken')
const { logDebug } = require('../services/proxyDebug')
const { config } = require('../config')

const OS_API_BASE = 'https://api.os.uk/'

module.exports = {
  method: ['GET', 'POST'],
  path: '/proxy/os/{path*}',
  options: {
    description: 'Proxy Ordnance Survey requests while injecting bearer token server-side',
    auth: false,
    handler: {
      proxy: {
        passThrough: true,
        mapUri: async (request) => {
          const path = request.params.path || ''
          const requestUrl = request?.url?.pathname ? `${request.url.pathname}${request.url.search || ''}` : 'unknown'
          const upstreamUrl = new URL(path, OS_API_BASE)

          Object.entries(request.query || {}).forEach(([key, value]) => {
            upstreamUrl.searchParams.set(key, value)
          })

          // OS Names API expects an explicit query param key, not only bearer auth.
          if (upstreamUrl.pathname.startsWith('/search/names/') && !upstreamUrl.searchParams.has('key')) {
            upstreamUrl.searchParams.set('key', config.ordnanceSurvey.osSearchKey)
          }

          logDebug('os request received', {
            method: request.method,
            requestUrl,
            routePath: path
          })
          logDebug('os upstream resolved', {
            upstreamUrl: `${upstreamUrl.origin}${upstreamUrl.pathname}`,
            hasQueryString: !!upstreamUrl.search
          })

          let token
          try {
            token = await getOsToken()
          } catch (error) {
            logDebug('os token fetch failed', { message: error.message })
            throw error
          }

          return {
            uri: upstreamUrl.toString(),
            headers: { authorization: `Bearer ${token.access_token}` }
          }
        }
      }
    }
  }
}
