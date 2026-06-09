const parseGeoJSON = async (buffer) => {
  try {
    const text = new TextDecoder().decode(buffer)
    const json = JSON.parse(text)

    // Wrap single Feature in FeatureCollection
    if (json.type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [json]
      }
    }

    // Handle FeatureCollection
    if (json.type === 'FeatureCollection') {
      return json
    }

    throw new Error('Invalid GeoJSON format')
  } catch (err) {
    throw new Error(`Could not parse GeoJSON: ${err.message}`)
  }
}

export { parseGeoJSON }
