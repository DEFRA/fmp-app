const multiparty = require('multiparty')
const gdal = require('gdal-async')
const fsSync = require('fs')
const fs = require('fs/promises')
const path = require('path')
const os = require('os')
const proj4 = require('proj4')
const constants = require('../constants')

// Initialise EPSG:27700 projection for proj4
const OSTN15Buffer = fsSync.readFileSync('OSTN15_NTv2_OSGBtoETRS.gsb').buffer
proj4.nadgrid('OSTN15_NTv2_OSGBtoETRS', OSTN15Buffer)
proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +units=m +no_defs +nadgrids=OSTN15_NTv2_OSGBtoETRS')

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

    // Either open the temp stored zip file or the buffer
    const ds = await gdal.openAsync(vsizipPath || buffer)

    const boundaryErrorSummary = validateDataset(ds)
    if (boundaryErrorSummary.length > 0) {
      return h.view(constants.views.UPLOAD, {
        errorSummary: boundaryErrorSummary
      })
    }

    const srs = ds.layers.get(0).srs.getAuthorityCode()

    const polygon = JSON.parse(ds.layers.get(0).features.first().getGeometry().toJSON()).coordinates[0].map(coordinate => {
      return transformPointToOSGB([coordinate[0], coordinate[1]], srs)
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

const transformPointToOSGB = (point, srs) => {
  if (srs === '4326' || srs === '3857') {
    return proj4(`EPSG:${srs}`, 'EPSG:27700', point)
  }
  return point
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

  if (ds.layers.get(0).srs.getAuthorityCode() !== '27700' && ds.layers.get(0).srs.getAuthorityCode() !== '4326' && ds.layers.get(0).srs.getAuthorityCode() !== '3857') {
    errorSummary.push({
      text: 'Coordinate system must be OSGB36, WGS84 or Web Mercator',
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
