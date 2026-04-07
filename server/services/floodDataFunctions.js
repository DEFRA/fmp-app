const formatFloodSource = (hasRiverSource, hasSeaSource) => {
  if (hasRiverSource && hasSeaSource) {
    return 'rivers and the sea'
  } else if (hasRiverSource) {
    return 'rivers'
  } else if (hasSeaSource) {
    return 'the sea'
  }
  return null
}

const assignFloodSource = (attributes, results) => {
  // The standard and CC attributes have different flood source field names and values, so we check all possibilities
  const floodSource = attributes.Flood_source || attributes.flood_source
  results.hasRiversSource = results.hasRiversSource ||
    floodSource === 'river' ||
    floodSource === 'river and sea'
  results.hasSeaSource = results.hasSeaSource ||
    floodSource === 'sea' ||
    floodSource === 'river and sea'
  return results
}

module.exports = {
  formatFloodSource,
  assignFloodSource
}
