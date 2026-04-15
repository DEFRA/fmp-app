const multiparty = require('multiparty')
const constants = require('../constants')
const fiftyMbNumeric = 50
const fiftyMbInBytes = fiftyMbNumeric * 1024 * 1024
const JSZip = require('jszip')

const handlers = {
  get: async (_request, h) => h.view(constants.views.UPLOAD),
  post: async (request, h) => {
    const file = await getFile(request)
    const errorSummary = validateFile(file)
    if (errorSummary.length > 0) {
      return h.view(constants.views.UPLOAD, {
        errorSummary
      })
    }

    const buffer = await streamToBuffer(file)
    const zip = await JSZip.loadAsync(buffer)

    // Remove .prj files from the zip so we do not convert
    // we will only allow OSTN15 OS coordinates.
    Object.keys(zip.files)
      .filter(name => name.toLowerCase().endsWith('.prj'))
      .forEach(name => zip.remove(name))

    const modifiedBuffer = await zip.generateAsync({ type: 'arraybuffer' })
    const { default: shp } = await import('shpjs') // needs to be imported here as only ESM can be used with shpjs
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

const getFile = (request) => {
  const form = new multiparty.Form()
  return new Promise((resolve, reject) => {
    form.on('part', (part) => {
      if (part.filename) {
        console.log(`file uploaded: ${part.filename}`)
        resolve(part)
      } else {
        reject(new Error('Non file received'))
      }
    })
    form.on('error', (err) => {
      reject(err)
    })
    form.parse(request.raw.req)
  })
}

const streamToBuffer = async (stream) => {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

const validateFile = (file) => {
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

  if (!geojson?.features || geojson.features.length !== 1) {
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
