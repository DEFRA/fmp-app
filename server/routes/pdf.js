const Joi = require('joi')
const Boom = require('boom')
const Wreck = require('@hapi/wreck')
const moment = require('moment-timezone')
const config = require('../../config')
const riskService = require('../services/risk')
const FloodZone = require('../models/flood-zone')
const util = require('../util')

module.exports = {
  method: 'POST',
  path: '/pdf',
  options: {
    description: 'Generate PDF',
    auth: {
      strategy: 'restricted'
    },
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
              baseURL: 'https://tiles.ordnancesurvey.co.uk/osmapapi/wmts/segab6nu/ts',
              version: '1.0.0',
              requestEncoding: 'KVP',
              customParams: {
                url: 'https://flood-warning-information.service.gov.uk/'
              },
              format: 'image/png',
              layer: 'osgb',
              opacity: 1,
              style: 'default',
              matrixSet: 'ZoomMap&url=https://flood-warning-information.service.gov.uk/',
              matrixIds: [{
                identifier: '00',
                matrixSize: [4, 6],
                resolution: 896,
                tileSize: [250, 250],
                topLeftCorner: [0, 1344000]
              }, {
                identifier: '01',
                matrixSize: [7, 12],
                resolution: 448,
                tileSize: [250, 250],
                topLeftCorner: [0, 1344000]
              }, {
                identifier: '02',
                matrixSize: [13, 24],
                resolution: 224,
                tileSize: [250, 250],
                topLeftCorner: [0, 1344000]
              }, {
                identifier: '03',
                matrixSize: [25, 48],
                resolution: 112,
                tileSize: [250, 250],
                topLeftCorner: [0, 1344000]
              }, {
                identifier: '04',
                matrixSize: [50, 96],
                resolution: 56,
                tileSize: [250, 250],
                topLeftCorner: [0, 1344000]
              }, {
                identifier: '05',
                matrixSize: [100, 192],
                resolution: 28,
                tileSize: [250, 250],
                topLeftCorner: [0, 1344000]
              }, {
                identifier: '06',
                matrixSize: [200, 384],
                resolution: 14,
                tileSize: [250, 250],
                topLeftCorner: [0, 1344000]
              }, {
                identifier: '07',
                matrixSize: [400, 768],
                resolution: 7,
                tileSize: [250, 250],
                topLeftCorner: [0, 1344000]
              }, {
                identifier: '08',
                matrixSize: [800, 1536],
                resolution: 3.5,
                tileSize: [250, 250],
                topLeftCorner: [0, 1344000]
              }, {
                identifier: '09',
                matrixSize: [1600, 3072],
                resolution: 1.75,
                tileSize: [250, 250],
                topLeftCorner: [0, 1344000]
              }, {
                identifier: '10',
                matrixSize: [3200, 6144],
                resolution: 0.875,
                tileSize: [250, 250],
                topLeftCorner: [0, 1344000]
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
