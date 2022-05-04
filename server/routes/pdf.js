const Joi = require('joi')
const Boom = require('boom')
const Wreck = require('wreck')
const moment = require('moment-timezone')
const config = require('../../config')
const riskService = require('../services/risk')
const FloodZone = require('../models/flood-zone')
const util = require('../util')
const { osMapsUrl, osMapsKey } = config.ordnanceSurvey

module.exports = {
  method: 'POST',
  path: '/pdf',
  options: {
    description: 'Generate PDF',
    handler: async (request, h) => {
      const id = request.payload.id
      let zone = request.payload.zone
      const scale = request.payload.scale
      const reference = request.payload.reference || '<Unspecified>'
      const siteUrl = config.siteUrl
      const geoserverUrl = config.geoserver
      const printUrl = geoserverUrl + '/geoserver/pdf/print.pdf'
      const polygon = request.payload.polygon ? JSON.parse(request.payload.polygon) : undefined
      const center = request.payload.center
      let vector

      // Get Flood zone if not provided
      if (!zone) {
        if (polygon) {
          zone = await riskService.getByPolygon(util.convertToGeoJson(polygon))
        } else {
          zone = await riskService.getByPoint(center[0], center[1])
        }
        const floodZone = new FloodZone(zone, !!polygon)
        zone = floodZone.zone
      }

      // Prepare point or polygon
      if (polygon) {
        vector = {
          type: 'vector',
          styles: {
            '': {
              strokeColor: '#b21122',
              strokeWidth: 3,
              fillColor: '#b21122',
              fillOpacity: 0.1
            }
          },
          geoJson: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [polygon]
            },
            properties: {}
          }
        }
      } else {
        vector = {
          type: 'vector',
          styles: {
            '': {
              externalGraphic: siteUrl + '/public/images/pin.png',
              graphicXOffset: -10.5,
              graphicYOffset: -30.5,
              graphicWidth: 21,
              graphicHeight: 30.5
            }
          },
          geoJson: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: center
            },
            properties: {}
          }
        }
      }

      // Prepare the PDF generate options
      const options = {
        payload: {
          layout: 'Map',
          srs: 'EPSG:27700',
          units: 'meters',
          geodetic: true,
          outputFormat: 'pdf',
          reference: reference,
          easting: parseInt(center[0]),
          scale: scale,
          northing: parseInt(center[1]),
          timestamp: moment().tz('Europe/London').format('D MMM YYYY H:mm'),
          pdfSummaryTemplate: `summary-template-${zone}.pdf`,
          pdfMapTemplate: polygon ? 'map-template-polygon.pdf' : 'map-template.pdf',
          layers: [
            {
              type: 'WMTS',
              baseURL: osMapsUrl,
              version: '1.0.0',
              requestEncoding: 'KVP',
              format: 'image/png',
              layer: 'Outdoor_27700',
              opacity: 1,
              style: 'default',
              matrixSet: `EPSG:27700&key=${osMapsKey}`,
              matrixIds: [{
                identifier: 'EPSG:27700:0',
                matrixSize: [5, 7],
                resolution: 896,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:1',
                matrixSize: [10, 13],
                resolution: 448,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:2',
                matrixSize: [20, 25],
                resolution: 224,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:3',
                matrixSize: [40, 49],
                resolution: 112,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:4',
                matrixSize: [80, 98],
                resolution: 56,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:5',
                matrixSize: [159, 195],
                resolution: 28,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:6',
                matrixSize: [318, 390],
                resolution: 14,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:7',
                matrixSize: [636, 779],
                resolution: 7,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:8',
                matrixSize: [1271, 1558],
                resolution: 3.5,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:9',
                matrixSize: [2542, 3116],
                resolution: 1.75,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:10',
                matrixSize: [5083, 6232],
                resolution: 0.875,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:11',
                matrixSize: [10165, 12463],
                resolution: 0.4375,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:12',
                matrixSize: [20329, 24925],
                resolution: 0.21875,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }, {
                identifier: 'EPSG:27700:13',
                matrixSize: [40657, 49849],
                resolution: 0.109375,
                tileSize: [256, 256],
                topLeftCorner: [-238375.0, 1376256.0]
              }]
            }, {
              type: 'WMTS',
              baseURL: geoserverUrl + '/geoserver/gwc/service/wmts',
              layer: 'fmp:fmp',
              version: '1.0.0',
              requestEncoding: 'KVP',
              format: 'image/png',
              opacity: 0.7,
              matrixSet: 'EPSG:27700',
              matrixIds: [{
                identifier: '00',
                matrixSize: [5, 5],
                resolution: 896,
                tileSize: [250, 250],
                topLeftCorner: [0, 1120000]
              }, {
                identifier: '01',
                matrixSize: [9, 9],
                resolution: 448,
                tileSize: [250, 250],
                topLeftCorner: [0, 1008000]
              }, {
                identifier: '02',
                matrixSize: [18, 18],
                resolution: 224,
                tileSize: [250, 250],
                topLeftCorner: [0, 1008000]
              }, {
                identifier: '03',
                matrixSize: [36, 36],
                resolution: 112,
                tileSize: [250, 250],
                topLeftCorner: [0, 1008000]
              }, {
                identifier: '04',
                matrixSize: [72, 72],
                resolution: 56,
                tileSize: [250, 250],
                topLeftCorner: [0, 1008000]
              }, {
                identifier: '05',
                matrixSize: [143, 143],
                resolution: 28,
                tileSize: [250, 250],
                topLeftCorner: [0, 1001000]
              }, {
                identifier: '06',
                matrixSize: [286, 286],
                resolution: 14,
                tileSize: [250, 250],
                topLeftCorner: [0, 1001000]
              }, {
                identifier: '07',
                matrixSize: [572, 572],
                resolution: 7,
                tileSize: [250, 250],
                topLeftCorner: [0, 1001000]
              }, {
                identifier: '08',
                matrixSize: [1143, 1143],
                resolution: 3.5,
                tileSize: [250, 250],
                topLeftCorner: [0, 1000125]
              }, {
                identifier: '09',
                matrixSize: [2286, 2286],
                resolution: 1.75,
                tileSize: [250, 250],
                topLeftCorner: [0, 1000125]
              }, {
                identifier: '10',
                matrixSize: [4572, 4572],
                resolution: 0.875,
                tileSize: [250, 250],
                topLeftCorner: [0, 1000125]
              }]
            }, vector],
          pages: [
            {
              center: center,
              scale: scale,
              dpi: 300,
              geodetic: false,
              strictEpsg4326: false
            }
          ]
        }
      }

      try {
        const result = await Wreck.post(printUrl, options)
        const date = new Date().toISOString()
        return h.response(result.payload)
          .encoding('binary')
          .type('application/pdf')
          .header('content-disposition', `attachment; filename=flood-map-planning-${date}.pdf;`)
          .state('pdf-download', id.toString())
      } catch (err) {
        return Boom.badImplementation((err && err.message) || 'An error occured during PDF generation', err)
      }
    },
    validate: {
      payload: {
        id: Joi.number().required(),
        zone: Joi.string().required().allow('FZ1', 'FZ2', 'FZ3', 'FZ3a', ''),
        reference: Joi.string().allow('').max(13).trim(),
        scale: Joi.number().allow(2500, 10000, 25000, 50000).required(),
        polygon: Joi.string().required().allow(''),
        center: Joi.array().required().allow('')
      }
    }
  }
}
