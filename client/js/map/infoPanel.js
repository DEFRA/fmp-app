const infoPanelURL = '/defra-map/info-panel'

// getInfoPanel: returns the infoPanel object, with html markup or null
const getInfoPanel = async (infoPanelValues) => {
  if (!infoPanelValues) {
    return null
  }
  const html = await getInfoPanelMarkup(infoPanelValues)
  const label = /TITLE:(.*)/.exec(html)?.[1]
  return { width: '360px', label, html }
}

// getInfoPanelMarkup: Make a cached request to get the info panel from the backend
const getInfoPanelMarkup = async (infoPanelValues) => {
  let url
  const queryString = new URLSearchParams()
  try {
    queryString.set('ds', infoPanelValues.ds)
    queryString.set('tf', infoPanelValues.tf)
    if (infoPanelValues.fz) { queryString.set('fz', infoPanelValues.fz) }
    if (infoPanelValues.fs) { queryString.set('fs', formatFloodSource(infoPanelValues.fs)) }
    if (infoPanelValues.aep) { queryString.set('aep', infoPanelValues.aep) }
    if (infoPanelValues.version) { queryString.set('v', infoPanelValues.version) }
    const { coords, depth = '' } = infoPanelValues

    url = `${infoPanelURL}?${queryString.toString()}`
    const response = await globalThis.fetch(url, { method: 'GET', cache: 'force-cache' })
    if (!response.ok) {
      throw new Error('Failed infoPanel get request')
    }

    return response.text().then((html) => {
      return html
        .replace('COORDS', coords)
        .replace('DEPTH', depth)
    })
  } catch (error) {
    console.log('Error fetching info panel', error)
    console.log('url: ', url)
    console.log('queryString: ', queryString)
  }

  return null
}

const formatFloodSource = (floodSource) => {
  if (!floodSource) {
    return ''
  }
  if (floodSource === 'Coastal') {
    return 'Sea'
  }
  if (floodSource === 'Fluvial') {
    return 'River'
  }
  return floodSource[0].toUpperCase() + floodSource.slice(1)
}

export { getInfoPanel }
