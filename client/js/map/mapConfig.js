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
    urls: 'https://api.os.uk/',
    before: async params => {
      params.url = params.url.replace('https://api.os.uk/', `${proxyBaseUrl}/proxy/basemap/`)
    }
  }]
}
