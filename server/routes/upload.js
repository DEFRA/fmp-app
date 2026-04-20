const { getFile, streamToBuffer } = require('../services/file-helper')
const constants = require('../constants')
const { validateShapeFile, validateGeoJSON } = require('../services/validate-uploaded-shape-file')
const fiftyMbNumeric = 50
const fiftyMbInBytes = fiftyMbNumeric * 1024 * 1024
const { extractProjectionFiles } = require('../services/zip-helper')

const handlers = {
  get: async (_request, h) => h.view(constants.views.UPLOAD),
  post: async (request, h) => {
    const file = await getFile(request)
    const errorSummary = validateShapeFile(file)
    if (errorSummary.length > 0) {
      return h.view(constants.views.UPLOAD, {
        errorSummary
      })
    }
    const { default: shp } = await import('shpjs') // needs to be imported here as only ESM can be used with shpjs
    const buffer = await streamToBuffer(file)
    const modifiedBuffer = await extractProjectionFiles(buffer)
    const geojson = await shp(modifiedBuffer)
    const boundaryErrorSummary = validateGeoJSON(geojson)

    if (boundaryErrorSummary.length > 0) {
      return h.view(constants.views.UPLOAD, {
        errorSummary: boundaryErrorSummary
      })
    }

    const polygon = geojson.features[0].geometry.coordinates[0]

    return h.redirect(`${constants.routes.MAP}?polygon=${JSON.stringify(polygon)}`)
  }
}

module.exports = [
  {
    method: 'GET',
    path: constants.routes.UPLOAD,
    options: {
      description: 'Upload Page',
      handler: handlers.get
    }
  },
  {
    method: 'POST',
    path: constants.routes.UPLOAD,
    handler: handlers.post,
    options: {
      payload: {
        maxBytes: fiftyMbInBytes,
        multipart: true,
        output: 'stream',
        parse: false
      }
    }
  }
]
