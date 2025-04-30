const multiparty = require('multiparty')
const gdal = require('gdal-async')
const fs = require('fs/promises')
const path = require('path')
const os = require('os')
const constants = require('../constants')

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
    let tmpDir, vsizipPath

    // If we have a zip file we need to save to a temp dir and read via gdal vsizip
    const isZip = file.filename.split('.').pop() === 'zip'
    if (isZip) {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shpzip-'))
      const zipPath = path.join(tmpDir, file.filename)
      await fs.writeFile(zipPath, buffer)
      vsizipPath = `/vsizip/${zipPath}`
    }

    // validation
    // is srs 27700
    // has 1 layer
    // has 1 feature
    // size of feature?

    // Either open the temp stored zip file or the buffer
    const ds = await gdal.openAsync(vsizipPath || buffer)

    const boundaryErrorSummary = validateDataset(ds)
    if (boundaryErrorSummary.length > 0) {
      return h.view(constants.views.UPLOAD, {
        errorSummary: boundaryErrorSummary
      })
    }

    const polygon = JSON.parse(ds.layers.get(0).features.first().getGeometry().toJSON()).coordinates[0].map(coordinate => {
      return [coordinate[0], coordinate[1]]
    })

    // Clean up temp file
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true })
    }

    return h.redirect(`${constants.routes.MAP}?polygon=${JSON.stringify(polygon)}`)
  }
}

const getFile = (request) => {
  const form = new multiparty.Form()
  return new Promise((resolve, reject) => {
    form.on('part', (part) => {
      if (!part.filename) {
        reject(new Error('Non file received'))
      } else {
        console.log(`file uploaded: ${part.filename}`)
        resolve(part)
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

const validateDataset = (ds) => {
  const errorSummary = []
  if (ds.layers.count() !== 1 || ds.layers.get(0).features.count() !== 1) {
    errorSummary.push({
      text: 'Only upload a shape with a single layer and single feature',
      href: '#boundary'
    })
  }

  if (ds.layers.get(0).features.first().getGeometry().toString() !== 'Polygon') {
    errorSummary.push({
      text: 'Feature must be a single polygon',
      href: '#boundary'
    })
  }

  if (ds.layers.get(0).srs.getAuthorityCode() !== '27700') {
    errorSummary.push({
      text: 'Coordinate system must be OSGB36 EPSG:27700',
      href: '#boundary'
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
        maxBytes: 50 * 1024 * 1024, // 50mb
        multipart: true,
        output: 'stream',
        parse: false
      }
    }
  }
]
