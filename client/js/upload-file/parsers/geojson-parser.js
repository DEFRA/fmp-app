const { fileCouldNotBeRead } = require('../upload-file-errors.js')

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
  } catch {
    throw new Error(fileCouldNotBeRead.summary)
  }
  throw new Error(fileCouldNotBeRead.summary)
}

export { parseGeoJSON }
