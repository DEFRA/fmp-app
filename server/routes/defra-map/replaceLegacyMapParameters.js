// lyr=fsa,fd,mainr

const featuresMap = {
  fsa: 'waterstorage',
  fd: 'flooddefence',
  mainr: 'mainrivers'
}

const setFeatures = (searchParams) => {
  if (!searchParams.get('features')) {
    const layerParam = searchParams.get('lyr')
    if (layerParam) {
      const features = layerParam.split(',')
        .map(layer => featuresMap[layer])
        .filter(feature => feature)
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
  const mapZoom = searchParams.get('map:zoom')
  const mapCentre = searchParams.get('map:center')
  if (cz) {
    const [x, y, zoom] = cz.split(',')
    if (!mapZoom) {
      searchParams.set('map:zoom', zoom)
    }
    if (!mapCentre) {
      searchParams.set('map:center', `${x},${y}`)
    }
  }
}

const setDataset = (searchParams, segmentParts) => {
  if (!searchParams.get('dataset')) {
    if (segmentParts.has('sw')) {
      searchParams.set('dataset', 'surfacewater')
    }
    if (segmentParts.has('fz')) {
      searchParams.set('dataset', 'floodzones')
    }
  }
}

const setTimeFrame = (searchParams, segmentParts) => {
  if (!searchParams.get('timeframe')) {
    if (segmentParts.has('pd') || segmentParts.has('fzpd')) {
      searchParams.set('timeframe', 'presentday')
    }
    if (segmentParts.has('cl') || segmentParts.has('fzcl')) {
      searchParams.set('timeframe', 'climatechange')
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

const requiredParameterOrder = ['map:center', 'map:zoom', 'dataset', 'timeframe', 'depth', 'aep', 'features', 'polygon', 'encodedPolygon']

const reorderSearchParams = (searchParams) => {
  const entries = [...searchParams.entries()]
  entries.sort(([a], [b]) => {
    const indexA = requiredParameterOrder.indexOf(a)
    const indexB = requiredParameterOrder.indexOf(b)
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })
  for (const key of [...searchParams.keys()]) {
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
