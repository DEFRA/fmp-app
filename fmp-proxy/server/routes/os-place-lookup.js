const { getOsToken } = require('../services/getOsToken')
const { logDebug } = require('../services/proxyDebug')
const { config } = require('../config')
const { badRequest } = require('@hapi/boom')

const OS_API_BASE = 'https://api.os.uk/'
const PLACE_LOOKUP_FILTER = [
  'LOCAL_TYPE:City',
  'LOCAL_TYPE:Hamlet',
  'LOCAL_TYPE:Other_Settlement',
  'LOCAL_TYPE:Town',
  'LOCAL_TYPE:PostCode',
  'LOCAL_TYPE:Village',
  'LOCAL_TYPE:Suburban_Area'
].join(' ')

const getSanitisedPlaceLookupQuery = (queryValue) => {
  let decodedQuery = ''

  try {
    decodedQuery = decodeURIComponent(String(queryValue || '')).trim()
  } catch (error) {
    throw badRequest('Invalid place lookup query')
  }

  if (!decodedQuery || decodedQuery.length < 2 || decodedQuery.length > 200) {
    throw badRequest('Invalid place lookup query')
  }

  return decodedQuery
}

const buildMapUri = async (request, routePath) => {
  const requestUrl = request?.url?.pathname ? `${request.url.pathname}${request.url.search || ''}` : 'unknown'
  const path = request.params?.path || routePath || ''
  const upstreamUrl = new URL(path || '/', OS_API_BASE)

  Object.entries(request.query || {}).forEach(([key, value]) => {
    upstreamUrl.searchParams.set(key, value)
  })

  if (upstreamUrl.pathname.startsWith('/search/names/') && !upstreamUrl.searchParams.has('key')) {
    upstreamUrl.searchParams.set('key', config.ordnanceSurvey.osSearchKey)
  }

  if (upstreamUrl.pathname.startsWith('/search/names/')) {
    upstreamUrl.searchParams.set('maxresults', upstreamUrl.searchParams.get('maxresults') || '8')
    upstreamUrl.searchParams.set('fq', upstreamUrl.searchParams.get('fq') || PLACE_LOOKUP_FILTER)
    upstreamUrl.searchParams.set('query', upstreamUrl.searchParams.get('query') || getSanitisedPlaceLookupQuery(request.params?.query || ''))
  }

  logDebug('os request received', {
    method: request.method,
    requestUrl,
    routePath: routePath || path
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

module.exports = {
  method: ['GET', 'POST'],
  path: '/proxy/place-lookup/{query}',
  options: {
    description: 'Proxy a vague OS place lookup request while injecting bearer token server-side',
    auth: false,
    handler: {
      proxy: {
        passThrough: true,
        mapUri: async (request) => {
          const rawQuery = request.params?.query || ''
          const placeQuery = getSanitisedPlaceLookupQuery(rawQuery)
          const routedRequest = {
            ...request,
            params: {
              ...request.params,
              path: 'search/names/v1/find',
              query: placeQuery
            },
            query: {
              ...(request.query || {}),
              query: placeQuery,
              maxresults: request.query?.maxresults || '8',
              fq: request.query?.fq || PLACE_LOOKUP_FILTER
            }
          }

          return buildMapUri(routedRequest, `place-lookup/${placeQuery}`)
        }
      }
    }
  }
}
