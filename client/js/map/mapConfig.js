let defraMapConfig

export const getDefraMapConfig = async () => {
  if (defraMapConfig === undefined) {
    const response = await window.fetch('/defra-map/config')
    defraMapConfig = await response.json()
  }
  return defraMapConfig
}

export const setupEsriConfig = async (esriConfig) => {
  const { fmpProxyUrl } = await getDefraMapConfig()
  getInterceptors(fmpProxyUrl).forEach((interceptor) => esriConfig.request.interceptors.push(interceptor))
}

const getInterceptors = (proxyBaseUrl) => {
  return [{
    urls: 'https://api.os.uk/maps/vector/v1/vts',
    before: async params => {
      params.url = params.url.replace('https://api.os.uk/', `${proxyBaseUrl}/proxy/os/`)
    }
  }]
}

// not used as going direct to proxy remove
export const getRequest = async (request) => {
  const { url, options } = request
  if (url.startsWith('https://api.os.uk')) {
    const { fmpProxyUrl } = await getDefraMapConfig()
    return {
      url: url.replace('https://api.os.uk/', `${fmpProxyUrl}/proxy/os/`),
      options
    }
  }
  return null
}
