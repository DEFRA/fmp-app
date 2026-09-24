const { replaceLegacyMapParameters, rewriteRequired } = require('./replaceLegacyMapParameters')

const requestToSearchParams = (request) => {
  const { query } = request
  const url = new URL(request.path, `${request.server.info.protocol}://${request.headers.host}`)
  url.search = new URLSearchParams(query).toString()
  return url.searchParams
}

module.exports = [{
  method: 'GET',
  path: '/map',
  options: {
    description: 'Show the interactive map page',
    handler: async (request, h) => {
      const searchParams = requestToSearchParams(request)
      if (rewriteRequired(searchParams)) {
        replaceLegacyMapParameters(searchParams)
        const rewrittenQuery = decodeURIComponent(searchParams.toString())
        return h.redirect(`/map?${rewrittenQuery}`)
      }
      return h.view('map')
    }
  }
}]
