const validateShapeFile = (file) => {
  const errorSummary = []
  const fileExt = file.filename.split('.').pop()
  if (fileExt !== 'zip' && fileExt !== 'gpkg' && fileExt !== 'geojson') {
    errorSummary.push({
      text: 'Only upload a GeoJSON file (.geojson), Geopackage (.gpkg) or Shape files (.zip)',
      href: '#boundary'
    })
  }

  return errorSummary
}

const validateGeoJSON = (geojson) => {
  const errorSummary = []

  if (geojson?.features?.length !== 1) {
    errorSummary.push({
      text: 'Only upload a GeoJSON with a single feature.',
      href: '#boundary',
    })
    return errorSummary
  }

  if (geojson.features[0].geometry.type !== 'Polygon') {
    errorSummary.push({
      text: 'Feature must be a single polygon.',
      href: '#boundary',
    })
  }

  const nodeCount = geojson?.features[0]?.geometry?.coordinates[0]?.length
  const maxNodes = 500
  if (nodeCount > maxNodes) {
    errorSummary.push({
      text: 'The uploaded file contains too many nodes. Maximum allowed is 500.',
      href: '#boundary'
    })
  }

  return errorSummary
}

module.exports = { validateShapeFile, validateGeoJSON }
