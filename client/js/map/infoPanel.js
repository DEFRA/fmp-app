// import { FloodMapLayer } from './mapLayers/index.js'
// import { terms } from './terms.js'

/*
  tf: Timeframe - [pd:Present day, cc:Climate change]
  ds: dataset - [fz,sw,rs],
  fz: Flood zone - [2,3,nd,cc or none]
  fs:, Flood source - [River,Sea, River and sea or none],
  aep: [low,medium,high or none]
*/
const infoPanelURL = '/defra-map/info-panel'

// const getInfoPanelValues = (mapState, feature, coord) => ({
//   ds: mapState.ds,
//   tf: getTimeFrame(mapState, feature),
//   aep: mapState.riskLevel,
//   fz: getFloodZone(mapState, feature),
//   fs: getFloodSource(mapState, feature),
//   depth: feature?.Depth_band,
//   coords: `${Math.round(coord[0])},${Math.round(coord[1])}`
// })

// getInfoPanel: returns the infoPanel object, with html markup or null
const getInfoPanel = async (infoPanelValues) => {
  // const { coords, feature } = getFeatureAndCoordsFromEvent(event)
  if (!infoPanelValues) {
    return null
  }
  // const infoPanelValues = getInfoPanelValues(mapState, feature, coords)
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

// const getFeatureAndCoordsFromEvent = (event) => {
//   const { coord: coords, features } = event.detail
//   if (!features || !coords || !features.isPixelFeaturesAtPixel) {
//     return {}
//   }
//   const feature = { ...features.items[0] }
//   return { coords, feature }
// }

// const getFloodZone = (mapState, feature) => {
//   if (!mapState.isFloodZone) {
//     return null
//   }
//   if (mapState.isClimateChange) {
//     const layerName = feature.name || feature.Name
//     // This Implies we have clicked on CC ZONE
//     if (layerName === 'Flood Zones plus climate change') {
//       return terms.keys.fzCC
//     }
//     if (layerName === 'Unavailable') {
//       return terms.keys.fzNoData
//     }
//   }
//   return feature.flood_zone || feature.Flood_zone
// }

const formatFloodSource = (floodSource) => {
  // const floodSource = feature.flood_source || feature.Flood_source
  if (!(floodSource)) {
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

// const getTimeFrame = (mapState, feature) => {
//   if (mapState.isClimateChange) {
//     const layerName = feature.name || feature.Name
//     if (mapState.isFloodZone && layerName !== 'Flood Zones plus climate change' && layerName !== 'Unavailable') {
//       return 'pd'
//     }
//     return 'cc'
//   }
//   return 'pd'
// }

export { getInfoPanel }
