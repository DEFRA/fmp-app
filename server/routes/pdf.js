const Joi = require('joi')
const Boom = require('boom')
const Wreck = require('wreck')
const config = require('../../config')

module.exports = {
  method: 'POST',
  path: '/pdf/{easting}/{northing}',
  config: {
    description: 'Generate PDF',
    handler: function (request, reply) {
      var easting = request.params.easting
      var northing = request.params.northing
      var id = request.payload.id
      var zone = request.payload.zone
      var title = request.payload.title
      var scale = request.payload.scale
      var siteUrl = config.siteUrl
      var printUrl = config.printUrl

      // Prepare the PDF generate options
      var options = {
        payload: {
          layout: 'Map',
          srs: 'EPSG:27700',
          units: 'meters',
          geodetic: true,
          outputFormat: 'pdf',
          siteUrl: siteUrl,
          title: title,
          easting: easting,
          northing: northing,
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
              baseURL: 'http://internal-DVFMP1ASLB01-611236341.eu-west-1.elb.amazonaws.com:8080/geoserver/gwc/service/wmts',
              layer: 'fmp:fmp',
              version: '1.0.0',
              requestEncoding: 'KVP',
              format: 'image/png',
              opacity: 0.7,
              matrixSet: 'EPSG:27700',
              matrixIds: [{
                identifier: '00',
                matrixSize: [3, 6],
                resolution: 896,
                tileSize: [250, 250],
                topLeftCorner: [1393.0196, 1357495]
              }, {
                identifier: '01',
                matrixSize: [6, 11],
                resolution: 448,
                tileSize: [250, 250],
                topLeftCorner: [1393.0196, 1245495]
              }, {
                identifier: '02',
                matrixSize: [12, 22],
                resolution: 224,
                tileSize: [250, 250],
                topLeftCorner: [1393.0196, 1245495]
              }, {
                identifier: '03',
                matrixSize: [24, 44],
                resolution: 112,
                tileSize: [250, 250],
                topLeftCorner: [1393.0196, 1245495]
              }, {
                identifier: '04',
                matrixSize: [50, 96],
                resolution: 56,
                tileSize: [250, 250],
                topLeftCorner: [1393.0196, 1231495]
              }, {
                identifier: '05',
                matrixSize: [96, 174],
                resolution: 28,
                tileSize: [250, 250],
                topLeftCorner: [1393.0196, 1231495]
              }, {
                identifier: '06',
                matrixSize: [192, 348],
                resolution: 14,
                tileSize: [250, 250],
                topLeftCorner: [1393.0196, 1231495]
              }, {
                identifier: '07',
                matrixSize: [383, 696],
                resolution: 7,
                tileSize: [250, 250],
                topLeftCorner: [1393.0196, 1231495]
              }, {
                identifier: '08',
                matrixSize: [766, 1391],
                resolution: 3.5,
                tileSize: [250, 250],
                topLeftCorner: [1393.0196, 1230620]
              }, {
                identifier: '09',
                matrixSize: [1531, 2782],
                resolution: 1.75,
                tileSize: [250, 250],
                topLeftCorner: [1393.0196, 1230620]
              }, {
                identifier: '10',
                matrixSize: [3062, 5563],
                resolution: 0.875,
                tileSize: [250, 250],
                topLeftCorner: [1393.0196, 1230401]
              }]
            }, {
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
                  coordinates: [easting, northing]
                },
                properties: {}
              }
            }],
          pages: [
            {
              center: [easting, northing],
              scale: scale,
              dpi: 300,
              geodetic: false,
              strictEpsg4326: false
            }
          ]
        }
      }

      // Set the zone onto the payload.
      // This flag is used to conditionally
      // show/hide parts of the PDF layout.
      options.payload['is' + zone] = true

      Wreck.post(printUrl, options, function (err, response, payload) {
        if (err || response.statusCode !== 200) {
          return reply(Boom.badImplementation(err && err.message || 'An error occured during PDF generation', err))
        }

        var date = new Date().toISOString()

        reply(payload)
          .encoding('binary')
          .type('application/pdf')
          .header('content-disposition', `attachment; filename=flood-map-planning-${date}.pdf;`)
          .state('pdf-download', id.toString())
      })
    },
    validate: {
      params: {
        easting: Joi.number().max(700000).positive().required(),
        northing: Joi.number().max(1300000).positive().required()
      },
      payload: {
        id: Joi.number().required(),
        zone: Joi.string().required().allow('FZ1', 'FZ2', 'FZ3', 'FZ3a'),
        title: Joi.string().required().max(100),
        scale: Joi.number().allow(3125, 6250, 12500, 25000, 50000, 100000, 200000, 500000, 1000000, 2000000, 4000000).required()
      }
    }
  }
}

