const { paramNames } = require('./mapParameterNames')

const featuresMap = {
  fsa: paramNames.FEATURES.WATER_STORAGE,
  fd: paramNames.FEATURES.FLOOD_DEFENCE,
  mainr: paramNames.FEATURES.MAIN_RIVERS
}

const setFeatures = (searchParams) => {
  if (!searchParams.get('features')) {
    const layerParam = searchParams.get('lyr')
    if (layerParam) {
      const features = layerParam.split(',')
        .map(layer => featuresMap[layer])
        .filter(Boolean)
      if (features.length) {
        searchParams.set('features', features.join(','))
      }
    }
  }
  searchParams.delete('lyr')
}

const setZoomAndCentre = (searchParams) => {
  const cz = searchParams.get('cz')
  searchParams.delete('cz')
  const mapZoom = searchParams.get(paramNames.ZOOM)
  const mapCentre = searchParams.get(paramNames.CENTRE)
  if (cz) {
    const [x, y, zoom] = cz.split(',')
    if (!mapZoom) {
      searchParams.set(paramNames.ZOOM, zoom)
    }
    if (!mapCentre) {
      searchParams.set(paramNames.CENTRE, `${x},${y}`)
    }
  }
}

const setDataset = (searchParams, segmentParts) => {
  if (!searchParams.get(paramNames.DATASET.KEY)) {
    if (segmentParts.has('mo')) {
      searchParams.set(paramNames.DATASET.KEY, paramNames.DATASET.NONE)
    }
    if (segmentParts.has('sw')) {
      searchParams.set(paramNames.DATASET.KEY, paramNames.DATASET.SURFACE_WATER)
    }
    if (segmentParts.has('fz')) {
      searchParams.set(paramNames.DATASET.KEY, paramNames.DATASET.FLOOD_ZONES)
    }
  }
}

const setTimeFrame = (searchParams, segmentParts) => {
  if (!searchParams.get(paramNames.TIMEFRAME.KEY)) {
    if (segmentParts.has('pd') || segmentParts.has('fzpd')) {
      searchParams.set(paramNames.TIMEFRAME.KEY, paramNames.TIMEFRAME.PRESENT_DAY)
    }
    if (segmentParts.has('cl') || segmentParts.has('fzcl')) {
      searchParams.set(paramNames.TIMEFRAME.KEY, paramNames.TIMEFRAME.CLIMATE_CHANGE)
    }
  }
}

const depthMap = {
  depthAll: 'depthAll',
  depth150: 'extentsFull',
  depth300: 'extentsOver150',
  depth600: 'extentsOver300',
  depth900: 'extentsOver600',
  depth1200: 'extentsOver900',
  depth2300: 'extentsOver1200',
  depthOver2300: 'extentsOver2300'
}

const setDepth = (searchParams, segmentParts) => {
  if (!searchParams.get('depth')) {
    for (const depthKey in depthMap) {
      if (segmentParts.has(depthKey)) {
        searchParams.set('depth', depthMap[depthKey])
        break
      }
    }
  }
}

const riskMap = {
  hr: 'high',
  mr: 'medium',
  lr: 'low',
}

const setAep = (searchParams, segmentParts) => {
  if (!searchParams.get('aep')) {
    for (const riskKey in riskMap) {
      if (segmentParts.has(riskKey)) {
        searchParams.set('aep', riskMap[riskKey])
        break
      }
    }
  }
}

const setDatasetParts = (searchParams) => {
  const seg = searchParams.get('seg')
  if (!seg) {
    return
  }
  const segmentParts = new Set(seg.split(','))
  searchParams.delete('seg')

  setDataset(searchParams, segmentParts)
  setTimeFrame(searchParams, segmentParts)
  setDepth(searchParams, segmentParts)
  setAep(searchParams, segmentParts)
}

const requiredParameterOrder = [paramNames.CENTRE, paramNames.ZOOM, paramNames.DATASET.KEY, paramNames.TIMEFRAME.KEY, 'depth', 'aep', 'features', 'polygon', 'encodedPolygon']

const reorderSearchParams = (searchParams) => {
  const entries = [...searchParams.entries()]
  entries.sort(([a], [b]) => {
    const indexA = requiredParameterOrder.indexOf(a)
    const indexB = requiredParameterOrder.indexOf(b)
    if (indexA === -1 && indexB === -1) {
      return 0
    }
    if (indexA === -1) {
      return 1
    }
    if (indexB === -1) {
      return -1
    }
    return indexA - indexB
  })

  // - prevent SonarQube warning it's unnecessary to convert to an array.
  // It's necessary to convert to an array to avoid modifying the collection while iterating.
  for (const key of [...searchParams.keys()]) { // NOSONAR
    searchParams.delete(key)
  }
  for (const [key, value] of entries) {
    searchParams.append(key, value)
  }
}

const replaceLegacyMapParameters = (searchParams) => {
  setDatasetParts(searchParams)
  setZoomAndCentre(searchParams)
  setFeatures(searchParams)
  reorderSearchParams(searchParams)
}

const rewriteRequired = (searchParams) => {
  return searchParams.has('cz') || searchParams.has('seg') || searchParams.has('lyr')
}

module.exports = { rewriteRequired, replaceLegacyMapParameters }
