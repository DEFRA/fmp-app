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

  return errorSummary
}

module.exports = { validateShapeFile, validateGeoJSON }
