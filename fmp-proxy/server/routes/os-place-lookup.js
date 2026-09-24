const { getOsToken } = require('../services/getOsToken')
const { logDebug } = require('../services/proxyDebug')

const OS_API_BASE = 'https://api.os.uk/'
const PATH = 'search/names/v1/find'

const buildMapUri = async (request) => {
  const query = request.params?.query
  const upstreamUri = `${OS_API_BASE}${PATH}?query=${query}&fq=local_type:postcode%20local_type:hamlet%20local_type:village%20local_type:town%20local_type:city%20local_type:suburban_area%20local_type:other_settlement&maxresults=100`

  logDebug('os lookup request received', {
    method: request.method,
    requestUrl: request.url.href,
  })
  logDebug('os lookup upstream resolved', {
    upstreamUrl: upstreamUri,
  })

  return {
    uri: upstreamUri,
    headers: { authorization: `Bearer ${(await getOsToken()).access_token}` }
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
        mapUri: buildMapUri
      }
    }
  }
}
