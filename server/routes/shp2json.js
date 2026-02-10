const fs = require('fs')
const util = require('util')
// const joi = require('joi')
const ogr2ogr = require('ogr2ogr').default
const rename = util.promisify(fs.rename)
const Polygon = require('../services/polygon')

async function updateAndValidateGeoJson (geojson, type) {
  if (geojson.crs?.properties?.name !== 'urn:ogc:def:crs:EPSG::27700') {
    throw new Error('Shape file contains invalid data. Must be in British National Grid (EPSG 27700) projection')
  }
  
  geojson.features.forEach(f => {
    const props = f.properties
    f.properties = {
      apply: type,
      start: props.Start_date
        ? moment(props.Start_date, 'YYYY/MM/DD').format('YYYY-MM-DD')
        : '',
      end: props.End_date
        ? moment(props.End_date, 'YYYY/MM/DD').format('YYYY-MM-DD')
        : '',
      info: props.display2 || props.Data_Type || ''
    }
    if (!validGeometyTypes.includes(f.geometry.type)) {
      throw new Error('Shape file contains invalid data. Must only contain Polygon types')
    }
  })
  return geojson
}

module.exports = {
  method: 'POST',
  path: '/shp2json',
  handler: async (request, _h) => {
    console.log('in shape 2 json')
    const { payload } = request
    const { geometry } = payload
    console.log('payload, params', payload)
    console.log('geometry', geometry)
    
    try {
      const tmpfile = geometry
      console.log('tmpfile', tmpfile)
      const zipfile = tmpfile + '.zip'
      console.log('zipfile', zipfile)
      await rename(tmpfile, zipfile)
      
      let data
      try {
        ({ data } = await ogr2ogr(zipfile))
      } catch (error) {
        throw new Error('Could not process uploaded file. Check if it\'s a valid shapefile')
      }
      console.log('data: ', data)

      // uncomment the below to use dummy data to bypass having to upload an actual shape file on dev
      // const data = require('./dummy-data/example_file.json')
      // const data = require('./dummy-data/example_file_broken.json')

      const uploadCoordinates = data.features[0].geometry.coordinates
      const uploadPolygon = new Polygon(uploadCoordinates[0])
      const indexedShapeData = await request.server.methods.getIndexedShapeData()
      const intersects = indexedShapeData.polygonHitTest(uploadPolygon)
      const geojson = await updateAndValidateGeoJson(data)

      return { geojson, intersects }
    } catch (err) {
      return console.log('Failed to get shape file data')
    }
  },
  // options: {
  //   payload: {
  //     maxBytes: 209715200,
  //     output: 'file',
  //     parse: true,
  //     allow: 'multipart/form-data',
  //     multipart: true
  //   },
  //   validate: {
  //     payload: joi.object().keys({
  //       geometry: joi.object().keys({
  //         bytes: joi.number().greater(0).required(),
  //         filename: joi.string().required(),
  //         headers: joi.object().required(),
  //         path: joi.string().required()
  //       }).required()
  //     })
  //   },
  //   app: {
  //     useErrorPages: false
  //   }
  // }
}
