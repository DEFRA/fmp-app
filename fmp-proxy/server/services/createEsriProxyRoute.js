const { getEsriToken } = require('./getEsriToken')
const { logDebug } = require('./proxyDebug')

const createEsriProxyRoute = ({
  path,
  baseUrl,
  description,
  logLabel
}) => {
  return {
    method: ['GET', 'POST'],
    path,
    options: {
      description,
      auth: false,
      handler: {
        proxy: {
          passThrough: true,
          mapUri: async (request) => {
            const requestPath = request.params.path || ''
            const targetUrl = new URL(requestPath, `${baseUrl.toString().replace(/\/$/, '')}/`)
            let requestUrl = 'unknown'

            // fallback to unknown request URL if not available, ignore for tests as cannot be easily mocked in unit tests
            /* istanbul ignore next */
            if (request?.url?.pathname) {
              requestUrl = `${request.url.pathname}${request.url.search || ''}`
            }

            logDebug(`${logLabel} request received`, {
              method: request.method,
              requestUrl,
              routePath: requestPath
            })

            let token
            try {
              ({ token } = await getEsriToken())
            } catch (error) {
              logDebug(`${logLabel} token fetch failed`, {
                message: error.message
              })
              throw error
            }

            Object.entries(request.query || {}).forEach(([key, value]) => {
              targetUrl.searchParams.set(key, value)
            })

            targetUrl.searchParams.delete('token')
            targetUrl.searchParams.set('token', token)

            logDebug(`${logLabel} upstream resolved`, {
              upstreamUrl: `${targetUrl.origin}${targetUrl.pathname}`,
              hasQueryString: !!targetUrl.search
            })

            return { uri: targetUrl.toString() }
          }
        }
      }
    }
  }
}

module.exports = {
  createEsriProxyRoute
}
