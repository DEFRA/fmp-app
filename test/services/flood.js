'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')

lab.experiment('Flood service test', () => {
  let sandbox

  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  lab.beforeEach(async () => {
    delete require.cache[require.resolve('../../server/services/flood.js')]
    delete require.cache[require.resolve('../../server/util.js')]
    sandbox = await sinon.createSandbox()
  })

  lab.afterEach(async () => {
    await sandbox.restore()
  })

  lab.test('Check flood service exists', () => {
    const floodService = require('../../server/services/flood')
    Code.expect(floodService).to.be.a.object()
  })

  lab.test('Test for flood warnings', async () => {
    const fakeFloodData = () => {
      return {
        floods: [{
          code: '013FWFD5',
          key: 174393,
          description: 'River Goyt at Whaley Bridge',
          quickdialnumber: '143052',
          region: 'North West',
          area: 'South',
          floodtype: 'f',
          severity: 1,
          severitydescription: 'Severe Flood Warning',
          warningkey: 106435,
          raised: '2019-08-04T18:38:00.000Z',
          severitychanged: '2019-08-01T12:51:00.000Z',
          messagechanged: '2019-08-04T18:38:00.000Z',
          message: 'River levels in the River Goyt could still rise rapidly as a result of water potentially flowing from Toddbrook Reservoir on 4th August 2019. \n\nPotential for short lived intense rain showers for this evening (04/08/19) and for a band of rain moving quickly through the area in the early hours of Monday morning (05/08/19). \n\nEvacuation plans have been implemented in Whaley Bridge. \n\nIf you believe that you are in immediate danger, please call 999. Please be aware of your surroundings, keep up to date with the current situation, and avoid using low lying footpaths near local watercourses.',
          geometry: '{"type":"Point","coordinates":[-1.98390234673153,53.3296569611127]}'
        }
        ]
      }
    }

    const floodService = require('../../server/services/flood')
    sandbox.stub(floodService, 'getFloods').callsFake(fakeFloodData)

    floodService.floods = await floodService.getFloods()

    await Code.expect(floodService.floods.floods[0].code).to.equal('013FWFD5')
    await Code.expect(floodService.floods.groups[0].title).to.equal('1 Severe flood warning')
    await Code.expect(floodService.floods.geojson.features[0].id).to.equal('flood_warning_alert.174393')
    await Code.expect(floodService.floods.timestamp).to.be.undefined()
  })

  lab.test('Test for outlook', async () => {
    const fakeOutlookData = () => {
      return {
        id: 1105,
        issued_at: '2019-08-06T09:30:00Z',
        pdf_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01105-2019-08-06_1030/fgs.pdf',
        detailed_csv_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01105-2019-08-06_1030/detailed.csv',
        area_of_concern_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01105-2019-08-06_1030/areaofconcern.jpg',
        flood_risk_trend:
        {
          day1: 'stable',
          day2: 'decreasing',
          day3: 'stable',
          day4: 'increasing',
          day5: 'increasing'
        },
        sources:
          [{ surface: 'The surface water flood risk is LOW.\n\nHeavy rain on Friday means significant flooding impacts are possible but not expected across many parts of England and Wales. Refer to Map 1. Following this rain, thunderstorms on Saturday may lead to further minor impacts in parts of northern England and Wales (Map 3). \n\nMinor surface water impacts are also possible today (see Map 2) due to heavy showers.\n' },
            { river: 'The river flood risk is LOW.\n\nHeavy rain on Friday means significant flooding impacts are possible but not expected across many parts of England and Wales. Refer to Map 1. Following this rain, thunderstorms on Saturday may lead to further minor impacts in parts of northern England and Wales (Map 3). Urban watercourses and small, fast responding river catchments are most at risk.\n\nMinor river flooding impacts are also possible but not expected today (see Map 2) due to heavy showers.\n\nThe ongoing situation at Toddbrook Reservoir is being managed by the relevant agencies to minimise the risk of flooding and has not been specifically shown on this product.' },
            { coastal: 'The coastal/tidal flood risk is VERY LOW for the next five days.' },
            { ground: 'The groundwater flood risk is VERY LOW for the next five days.' }],
        headline: 'Significant surface water and river flooding impacts are possible but not expected on Friday across much of England and Wales. Minor impacts possible at other other times. The overall flood risk is LOW.',
        amendments: '',
        future_forecast: '',
        last_modified_at: '2019-08-06T09:27:03Z',
        next_issue_due_at: '2019-08-07T09:30:00Z',
        png_thumbnails_with_days_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01105-2019-08-06_1030/FGSthumbnails-with-days.png',
        risk_areas:
          [{
            id: 1950,
            statement_id: 1105,
            updated_at: '2019-08-06T09:22:29Z',
            beyond_five_days: false,
            ordering: 2,
            risk_area_blocks: [
              {
                id: 2035,
                days: [5],
                risk_area_id: 1950,
                risk_levels: {
                  river: [2, 2],
                  surface: [2, 2],
                  coastal: [2, 2]
                },
                additional_information: 'Heavy thundery showers. Urban areas and small catchments most at risk.',
                polys:
                  [
                    {
                      id: 2660,
                      coordinates:
                        [
                          [
                            [-4.174804687500001, 54.625522440842246],
                            [-3.146484643220902, 54.96247882239579],
                            [-2.531250268220902, 55.36412729483159],
                            [-2.3994143307209015, 55.65031856976615],
                            [-1.9599612057209017, 55.90980992336868],
                            [0.47141432762146, 53.83838539206968],
                            [0.21972656250000003, 53.32848623940286],
                            [-4.630237072706223, 53.13119286673744],
                            [-4.174804687500001, 54.625522440842246]
                          ]
                        ],
                      area: 8.42310580332646,
                      label_position: [-2.08465592935681, 54.1276207351252],
                      poly_type: 'inland',
                      risk_area_block_id: 2035,
                      counties: [
                        {
                          name: 'Lincolnshire'
                        },
                        {
                          name: 'Hartlepool'
                        },
                        {
                          name: 'Merseyside'
                        },
                        {
                          name: 'Gtr Manchester'
                        },
                        {
                          name: 'W Yorkshire'
                        },
                        {
                          name: 'Redcar and Cleveland'
                        },
                        {
                          name: 'E Riding of Yorkshire'
                        },
                        {
                          name: 'Nottinghamshire'
                        },
                        {
                          name: 'Flintshire'
                        },
                        {
                          name: 'Kingston upon Hull'
                        },
                        {
                          name: 'S Yorkshire'
                        },
                        {
                          name: 'Northumberland'
                        },
                        {
                          name: 'NE Lincolnshire'
                        },
                        {
                          name: 'Blackpool'
                        },
                        {
                          name: 'N Yorkshire'
                        },
                        {
                          name: 'Gwynedd'
                        },
                        {
                          name: 'Isle of Anglesey'
                        },
                        {
                          name: 'Durham'
                        },
                        {
                          name: 'York'
                        },
                        {
                          name: 'Warrington'
                        },
                        {
                          name: 'Darlington'
                        },
                        {
                          name: 'Stockton-on-Tees'
                        },
                        {
                          name: 'Derbyshire'
                        }, {
                          name: 'Denbighshire'
                        },
                        {
                          name: 'Lancashire'
                        },
                        {
                          name: 'Cumbria'
                        },
                        {
                          name: 'Blackburn with Darwen'
                        },
                        {
                          name: 'Halton'
                        },
                        {
                          name: 'Tyne and Wear'
                        },
                        {
                          name: 'N Lincolnshire'
                        }, {
                          name: 'Conwy'
                        },
                        {
                          name: 'Cheshire'
                        },
                        {
                          name: 'Middlesbrough'
                        }
                      ]
                    }
                  ]
              }
            ]
          }
          ],
        aoc_maps:
          [{
            id: 1178,
            title: 'Specific Areas of Concern Map 3 - Saturday 10 August',
            ordering: 2,
            caption: '',
            ratio: [Array],
            statement_id: 1105,
            polys: [Array]
          }
          ],
        public_forecast:
        {
          id: 1105,
          english_forecast: 'Local flooding is possible but not expected from surface water and rivers across many parts of England and Wales on Friday due to widespread, heavy rain. Properties may flood and there may be travel disruption.\n\nLocal flooding is possible from surface water and rivers today in parts of the south of England and Wales, and on Saturday in the north of England and Wales due to heavy showers. Land, roads and some properties may flood and there may be travel disruption. \n\n',
          welsh_forecast: 'Mae llifogydd lleol yn bosibl ond heb eu disgwyl fel canlyniad o ddŵr wyneb a’r afonydd ar draws sawl rhan o Loegr a Chymru ar ddydd Gwener oherwydd glaw trwm, eang. Gallai eiddo dioddef llifogydd a gallai fod trafferthion wrth deithio.\n \nMae llifogydd lleol yn bosibl fel canlyniad o ddŵr wyneb a’r afonydd heddiw mewn rhannau o dde Lloegr a Chymru, ac ar ddydd Sadwrn yng ngogledd Lloegr a Chymru oherwydd cawodydd trwm. Gallai dir, ffyrdd a rhai eiddo dioddef llifogydd a gallai fod trafferthion wrth deithio.\n',
          england_forecast: 'Service not available.',
          wales_forecast_english: 'Service not available.',
          wales_forecast_welsh: 'Service not available.',
          published_at: '2019-08-06T10:06:26Z'
        }
      }
    }

    const floodService = require('../../server/services/flood')

    sandbox.stub(floodService, 'getOutlook').callsFake(fakeOutlookData)

    floodService.outlook = await floodService.getOutlook()

    await Code.expect(floodService.outlook.issueDate).to.be.a.date()
    await Code.expect(floodService.outlook.timestampOutlook).to.equal(1565083800000)
    await Code.expect(floodService.outlook.hasOutlookConcern).to.be.true
    await Code.expect(floodService.outlook.geoJson.type).to.equal('FeatureCollection')
    await Code.expect(floodService.outlook.riskLevels).to.be.an.array()
    await Code.expect(floodService.outlook.full).to.contain('Local flooding is possible but not expected from surface water')
    await Code.expect(floodService.outlook.days).to.be.an.array()
    await Code.expect(floodService.outlook.days.length).to.equal(5)
  })

  lab.test('Test getFloods endpoint', async () => {
    const fakeFloodData = () => { return { getFloods: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getFloods()

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getFloods).to.equal('TEST')
  })

  lab.test('Test getFloodsWithin endpoint', async () => {
    const fakeFloodData = () => { return { getFloodsWithin: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getFloodsWithin([1, 2, 3, 4])

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getFloodsWithin).to.equal('TEST')
  })

  lab.test('Test getFloodArea endpoint', async () => {
    const fakeFloodData = () => { return { getFloodArea: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getFloodArea('1234w')

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getFloodArea).to.equal('TEST')
  })

  lab.test('Test getOutlook endpoint', async () => {
    const fakeFloodData = () => { return { statements: ['TEST'] } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getOutlook()

    await Code.expect(result).to.be.a.string()
    await Code.expect(result).to.equal('TEST')
  })

  lab.test('Test getStationById endpoint', async () => {
    const fakeFloodData = () => { return { getStationById: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getStationById(1, 'u')

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getStationById).to.equal('TEST')
  })

  lab.test('Test getStationsWithin endpoint', async () => {
    const fakeFloodData = () => { return { getStationsWithin: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getStationsWithin([1, 2, 3, 4])

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getStationsWithin).to.equal('TEST')
  })

  lab.test('Test getStationsUpstreamDownstream endpoint', async () => {
    const fakeFloodData = () => { return { getStationsUpstreamDownstream: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getStationsUpstreamDownstream(1, 'u')

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getStationsUpstreamDownstream).to.equal('TEST')
  })

  lab.test('Test getStationsWithinRadius endpoint', async () => {
    const fakeFloodData = () => { return { getStationsWithinRadius: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getStationsWithinRadius(1.00, 2.00, 1000)

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getStationsWithinRadius).to.equal('TEST')
  })

  lab.test('Test getStationTelemetry endpoint', async () => {
    const fakeFloodData = () => { return { getStationTelemetry: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getStationTelemetry('u', 7077)

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getStationTelemetry).to.equal('TEST')
  })

  lab.test('Test getStationForecastThresholds endpoint', async () => {
    const fakeFloodData = () => { return { getStationForecastThresholds: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getStationForecastThresholds(7077)

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getStationForecastThresholds).to.equal('TEST')
  })

  lab.test('Test getStationForecastData endpoint', async () => {
    const fakeFloodData = () => { return { getStationForecastData: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getStationForecastData(7077)

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getStationForecastData).to.equal('TEST')
  })

  lab.test('Test getStationsGeoJson endpoint', async () => {
    const fakeFloodData = () => { return { getStationsGeoJson: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getStationsGeoJson()

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getStationsGeoJson).to.equal('TEST')
  })

  lab.test('Test getIsEngland endpoint', async () => {
    const fakeFloodData = () => { return { getIsEngland: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getIsEngland()

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getIsEngland).to.equal('TEST')
  })

  lab.test('Test getImpactData endpoint', async () => {
    const fakeFloodData = () => { return { getImpactData: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getImpactData(7077)

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getImpactData).to.equal('TEST')
  })

  lab.test('Test getImpactsWithin endpoint', async () => {
    const fakeFloodData = () => { return { getImpactsWithin: 'TEST' } }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeFloodData)

    const floodService = require('../../server/services/flood')

    const result = await floodService.getImpactsWithin([1, 2, 3, 4])

    await Code.expect(result).to.be.an.object()
    await Code.expect(result.getImpactsWithin).to.equal('TEST')
  })
})
