require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const { payloadMatchTest } = require('../utils')
const FloodRiskView = require('../../server/models/flood-risk-view')
const sinon = require('sinon')
const { JSDOM } = require('jsdom')
const zeroAreaPolygons = require('../services/zeroAreaPolygons')

lab.experiment('flood-zone-results', () => {
  let server
  let restoreGetPsoContactsByPolygon
  let restoreGetFloodZonesByPolygon
  let restoreIgnoreUseAutomatedService
  const LocalAuthorities = 'Ryedale'

  const optInPSOContactResponse = {
    isEngland: true,
    EmailAddress: 'psoContact@example.com',
    AreaName: 'Yorkshire',
    useAutomatedService: true,
    LocalAuthorities
  }

  const optOutPSOContactResponse = {
    isEngland: true,
    EmailAddress: 'psoContact@example.com',
    AreaName: 'Yorkshire',
    useAutomatedService: false,
    LocalAuthorities
  }

  const emptyPSOContactResponse = {
    isEngland: true,
    EmailAddress: '',
    AreaName: '',
    LocalAuthorities: '',
    useAutomatedService: false
  }

  const fzrUrlPolygon =
    '[[479657,484223],[479655,484224],[479730,484210],[479657,484223]]'
  const fzrUrl = `/flood-zone-results?location=Pickering&polygon=${fzrUrlPolygon}&center=[479472,484194]`

  const zone1GetByPolygonResponse = {
    in_england: true,
    floodzone_3: false,
    floodzone_2: false,
    surface_water: true,
    extra_info: null
  }

  const zone2GetByPolygonResponse = Object.assign(
    {},
    zone1GetByPolygonResponse,
    {
      floodzone_2: true
    }
  )

  const zone3GetByPolygonResponse = Object.assign(
    {},
    zone1GetByPolygonResponse,
    {
      floodzone_3: true,
      floodzone_2: true
    }
  )

  const zone3WithDefenceGetByPolygonResponse = Object.assign(
    {},
    zone3GetByPolygonResponse
  )

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
    restoreIgnoreUseAutomatedService = server.methods.ignoreUseAutomatedService
    restoreGetPsoContactsByPolygon = server.methods.getPsoContactsByPolygon
    restoreGetFloodZonesByPolygon = server.methods.getFloodZonesByPolygon
    server.methods.getPsoContactsByPolygon = async () => optInPSOContactResponse
  })

  lab.after(async () => {
    server.methods.getPsoContactsByPolygon = restoreGetPsoContactsByPolygon
    server.methods.getFloodZonesByPolygon = restoreGetFloodZonesByPolygon
    server.methods.ignoreUseAutomatedService = restoreIgnoreUseAutomatedService
    await server.stop()
  })

  lab.test('get flood-zone-results with a valid polygon should succeed', async () => {
    server.methods.getPsoContactsByPolygon = async () => optInPSOContactResponse
    server.methods.getFloodZonesByPolygon = async () => zone1GetByPolygonResponse
    const response = await server.inject({ method: 'GET', url: fzrUrl })
    const { payload } = response
    Code.expect(response.statusCode).to.equal(200)
    // FCRM 3594
    await payloadMatchTest(
      payload,
      /<figcaption class="govuk-visually-hidden" aria-hidden="false">[\s\S]*[ ]{1}A map showing the flood risk for the location you have provided[\s\S]*<\/figcaption>/g,
      1
    )
  })

  lab.test('get flood-zone-results with a empty contact details should succeed', async () => {
    server.methods.getPsoContactsByPolygon = async () => emptyPSOContactResponse
    server.methods.getFloodZonesByPolygon = async () => zone1GetByPolygonResponse
    const response = await server.inject({ method: 'GET', url: fzrUrl })
    const { payload } = response
    Code.expect(response.statusCode).to.equal(200)
    // FCRM 3594
    await payloadMatchTest(
      payload,
      /<figcaption class="govuk-visually-hidden" aria-hidden="false">[\s\S]*[ ]{1}A map showing the flood risk for the location you have provided[\s\S]*<\/figcaption>/g,
      1
    )
  })

  lab.test(
    'get flood-zone-results with a valid polygon should call buildFloodZoneResultsData',
    async () => {
      const options = {
        method: 'GET',
        url: fzrUrl
      }
      const FloodRiskViewModelSpy = sinon.spy(FloodRiskView, 'Model')

      server.methods.getPsoContactsByPolygon = async () =>
        optInPSOContactResponse
      server.methods.getFloodZonesByPolygon = () => zone1GetByPolygonResponse
      await server.inject(options)

      Code.expect(FloodRiskViewModelSpy.callCount).to.equal(1)
      Code.expect(FloodRiskViewModelSpy.args[0][0]).to.equal({
        psoEmailAddress: 'psoContact@example.com',
        areaName: 'Yorkshire',
        floodZoneResults: {
          in_england: true,
          floodzone_3: false,
          floodzone_2: false,
          surface_water: true,
          extra_info: null
        },
        center: [479472, 484194],
        polygon: [
          [479657, 484223],
          [479655, 484224],
          [479730, 484210],
          [479657, 484223]
        ],
        location: 'Pickering',
        placeOrPostcode: undefined,
        useAutomatedService: true,
        plotSize: '0',
        localAuthorities: 'Ryedale'
      })
    }
  )

  const testIfP4DownloadButtonExists = async (payload, shouldExist = true) => {
    // Test that the Request flood risk assessment data heading is present
    await payloadMatchTest(
      payload,
      /Order flood risk data for rivers and the sea/g,
      shouldExist ? 1 : 1
    )
    await payloadMatchTest(
      payload,
      /<p class="govuk-heading-m">Request flood risk assessment data<\/p>/g,
      0
    ) // should never exist

    // Test that the 'Request your flood risk assessment data' button is present
    await payloadMatchTest(
      payload,
      /Order flood risk data/g,
      shouldExist ? 2 : 1
    )
  }

  lab.test(
    'get flood-zone-results request data button should be hidden if useAutomated is false',
    async () => {
      const options = { method: 'GET', url: fzrUrl }
      server.methods.getPsoContactsByPolygon = async () =>
        optOutPSOContactResponse
      server.methods.ignoreUseAutomatedService = () => false
      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
      const { payload } = response
      await testIfP4DownloadButtonExists(payload, false)
    }
  )

  lab.test(
    'get flood-zone-results request data button should be present if useAutomated is true',
    async () => {
      const options = { method: 'GET', url: fzrUrl }
      server.methods.getPsoContactsByPolygon = async () =>
        optInPSOContactResponse
      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
      const { payload } = response
      await testIfP4DownloadButtonExists(payload, true)
    }
  )

  lab.test(
    'get flood-zone-results request data button should be present if useAutomated is false and config.ignoreUseAutomatedService is true',
    async () => {
      const options = { method: 'GET', url: fzrUrl }
      server.methods.getPsoContactsByPolygon = async () =>
        optOutPSOContactResponse
      server.methods.ignoreUseAutomatedService = () => true
      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
      const { payload } = response
      await testIfP4DownloadButtonExists(payload, true)
    }
  )

  lab.test(
    'get flood-zone-results with valid polygon parameters and psoContactResponse should succeed',
    async () => {
      server.methods.getPsoContactsByPolygon = async () => ({
        isEngland: true,
        EmailAddress: 'psoContact@example.com',
        AreaName: 'Yorkshire',
        LocalAuthorities
      })
      const response = await server.inject({ method: 'GET', url: fzrUrl })
      Code.expect(response.statusCode).to.equal(200)
    }
  )

  const psoContactResponses = [
    [
      'areaName only in psoContactResponse',
      { AreaName: 'Yorkshire', LocalAuthorities }
    ],
    [
      'emailAddress only in psoContactResponse',
      { EmailAddress: 'psoContact@example.com', LocalAuthorities }
    ]
  ]
  psoContactResponses.forEach(([psoContactDescription, psoContactResponse]) => {
    lab.test(
      `get flood-zone-results with valid polygon parameters and psoContact response - ${psoContactDescription} - should redirect to /england-only`,
      async () => {
        const options = { method: 'GET', url: fzrUrl }
        server.methods.getPsoContactsByPolygon = async () => psoContactResponse
        const response = await server.inject(options)
        const { headers } = response
        const expectedRedirectUrl =
          '/england-only?location=Pickering&polygon=%5B%5B479657%2C484223%5D%2C%5B479655%2C484224%5D%2C%5B479730%2C484210%5D%2C%5B479657%2C484223%5D%5D&center=%5B479472%2C484194%5D'
        Code.expect(headers.location).to.equal(expectedRedirectUrl)
      }
    )
  })

  lab.test(
    'get flood-zone-results with a non england result should redirect to /england-only',
    async () => {
      const options = { method: 'GET', url: fzrUrl }
      server.methods.getPsoContactsByPolygon = async () => ({
        isEngland: false,
        EmailAddress: 'psoContact@example.com',
        AreaName: 'Yorkshire'
      })
      server.methods.getFloodZonesByPolygon = () => ({ in_england: false })

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(302)
      const { headers } = response
      const expectedRedirectUrl =
        '/england-only?location=Pickering&polygon=%5B%5B479657%2C484223%5D%2C%5B479655%2C484224%5D%2C%5B479730%2C484210%5D%2C%5B479657%2C484223%5D%5D&center=%5B479472%2C484194%5D'
      Code.expect(headers.location).to.equal(expectedRedirectUrl)
    }
  )

  lab.test(
    'get flood-zone-results should error if a library error occurs',
    async () => {
      const options = { method: 'GET', url: fzrUrl }
      server.methods.getPsoContactsByPolygon = async () => ({
        isEngland: true,
        EmailAddress: 'psoContact@example.com',
        AreaName: 'Yorkshire',
        LocalAuthorities
      })
      server.methods.getFloodZonesByPolygon = () => {
        throw new Error('Deliberate Testing Error ')
      }

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(500)
    }
  )

  lab.test(
    'get flood-zone-results with a non england result should redirect to /england-only',
    async () => {
      const url =
        '/flood-zone-results?center=[341638,352001]&location=Caldecott%2520Green&polygon=[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]'
      const options = { method: 'GET', url }
      server.methods.getPsoContactsByPolygon = async () => Object.assign({}, optInPSOContactResponse, { isEngland: false })
      server.methods.getFloodZonesByPolygon = () => ({ in_england: false })
      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(302)
      const { headers } = response
      const expectedRedirectUrl =
        '/england-only?center=%5B341638%2C352001%5D&location=Caldecott%2520Green&polygon=%5B%5B479472%2C484194%5D%2C%5B479467%2C484032%5D%2C%5B479678%2C484015%5D%2C%5B479691%2C484176%5D%2C%5B479472%2C484194%5D%5D'
      Code.expect(headers.location).to.equal(expectedRedirectUrl)
    }
  )

  // The bestGuessRedirectTests test the old method of redirection, which was to infer the confirm-location
  // url from the fzr url. It covers fzr requests that dont come from /confirm-location as well as
  // requests that dont have a referer, or have an invalid referer
  const bestGuessRedirectTests = [
    {
      testName: 'a flood-zone-results without a polygon or header'
    },
    {
      testName: 'a flood-zone-results without a polygon or referer',
      requestHeaders: {}
    },
    {
      testName:
        'a flood-zone-results without a polygon or referer other than /confirm-location',
      requestHeaders: {
        referer:
          'http://localhost:3000/some-other-page?with=some&random=parameters'
      }
    },
    {
      testName: 'a flood-zone-results without a polygon and an invalid referer',
      requestHeaders: {
        referer: '/some-other-page?with=some&random=parameters'
      }
    }
  ]

  bestGuessRedirectTests.forEach(({ testName, requestHeaders }) => {
    lab.test(
      `${testName} should redirect to /confirm-location with best guess url`,
      async () => {
        const url =
          '/flood-zone-results?easting=479472&northing=484194&location=Pickering'
        const options = { method: 'GET', url, headers: requestHeaders }
        const response = await server.inject(options)
        Code.expect(response.statusCode).to.equal(302)
        const { headers } = response
        const expectedRedirectUrl =
          '/confirm-location?easting=479472&northing=484194&placeOrPostcode=Pickering&polygonMissing=true'
        Code.expect(headers.location).to.equal(expectedRedirectUrl)
      }
    )
  })

  const validRefererRedirectTests = [
    {
      testName: 'placeOrPostcode',
      url: '/flood-zone-results?easting=479673&northing=484079&location=Pickering',
      referer:
        '/confirm-location?easting=479673&northing=484079&placeOrPostcode=pickering&locationDetails=Pickering%2C+Ryedale%2C+North+Yorkshire%2C+Yorkshire+and+the+Humber%2C+England&isPostCode=false'
    },
    {
      testName: 'easting / northing',
      url: '/flood-zone-results?easting=386321&northing=397947&location=386321%2520397947',
      referer: '/confirm-location?easting=386321&northing=397947'
    },
    {
      testName: 'National Grid Reference',
      url: '/flood-zone-results?easting=386321&northing=397947&location=SJ8632197947',
      referer:
        '/confirm-location?easting=386321&northing=397947&nationalGridReference=SJ8632197947'
    }
  ]
  validRefererRedirectTests.forEach(({ testName, url, referer }) => {
    lab.test(
      `a flood-zone-results without a polygon should redirect to the the referer - ${testName}`,
      async () => {
        const options = {
          method: 'GET',
          url,
          headers: {
            referer: `http://localhost:3000${referer}`
          }
        }
        const response = await server.inject(options)
        Code.expect(response.statusCode).to.equal(302)
        const { headers } = response
        const expectedRedirectUrl = `${referer}&polygonMissing=true`
        Code.expect(headers.location).to.equal(expectedRedirectUrl)
      }
    )
  })

  const getByPolygonResponses = [
    [zone1GetByPolygonResponse, 1],
    [zone2GetByPolygonResponse, 2],
    [zone3GetByPolygonResponse, 3],
    [zone3WithDefenceGetByPolygonResponse, 3]
  ]

  getByPolygonResponses.forEach(
    async ([getByPolygonResponse, expectedFloodZone]) => {
      const getDocument = async () => {
        const options = { method: 'GET', url: fzrUrl }
        server.methods.getFloodZonesByPolygon = () => getByPolygonResponse
        server.methods.getPsoContactsByPolygon = async () => optInPSOContactResponse
        const response = await server.inject(options)
        const { payload } = response
        const {
          window: { document: doc }
        } = await new JSDOM(payload)
        return doc
      }
      lab.test(
        `flood-zone-results heading should state This location is in Flood Zone ${expectedFloodZone}`,
        async () => {
          const doc = await getDocument()
          const headingElement = doc.querySelectorAll(
            '#main-content h1.govuk-heading-xl'
          )
          Code.expect(headingElement.length).to.equal(1)
          Code.expect(headingElement[0].textContent.trim()).to.equal(
            `This location is in flood zone ${expectedFloodZone}`
          )
        }
      )

      lab.test(
        'flood-zone-results - Redraw the boundary url should contain the polygon',
        async () => {
          const doc = await getDocument()
          const redrawElement = doc.querySelectorAll(
            'a[href*="confirm-location"]'
          )
          Code.expect(redrawElement.length).to.equal(1)
          Code.expect(redrawElement[0].textContent).to.contain(
            'Redraw the boundary of your site'
          )
          Code.expect(redrawElement[0].href).to.equal(
            `confirm-location?easting=479472&northing=484194&placeOrPostcode=Pickering&polygon=${fzrUrlPolygon}`
          )
        }
      )
    }
  )

  let zeroAreaPolygonsTestCount = 0

  zeroAreaPolygons.forEach(
    ([zeroAreaPolygon, expectedBuffedPolygon, expectedMinMaxXY]) => {
      const expectedPolygonString = JSON.stringify(expectedBuffedPolygon)
      const center = JSON.stringify(expectedMinMaxXY[0])
      const fzrBuffedZeroAreaPolygonUrl = `/flood-zone-results?polygon=${expectedPolygonString}&center=${center}&location=Pickering`

      lab.test(
        `a flood zone request for ${expectedPolygonString} should not redirect`,
        async () => {
          server.methods.getFloodZonesByPolygon = () => zone1GetByPolygonResponse
          server.methods.getPsoContactsByPolygon = async () => optInPSOContactResponse
          const options = { method: 'GET', url: fzrBuffedZeroAreaPolygonUrl }
          const response = await server.inject(options)
          Code.expect(response.statusCode).to.equal(200)
          zeroAreaPolygonsTestCount++
        }
      )
    }
  )

  zeroAreaPolygons.forEach(
    ([zeroAreaPolygon, _expectedBuffedPolygon, expectedMinMaxXY]) => {
      const zeroAreaPolygonString = JSON.stringify(zeroAreaPolygon)
      const center = JSON.stringify(expectedMinMaxXY[0])
      const fzrBuffedZeroAreaPolygonUrl = `/flood-zone-results?polygon=${zeroAreaPolygonString}&center=${center}&location=Pickering`

      lab.test(
        `a flood zone request for ${zeroAreaPolygonString} should redirect: , ${fzrBuffedZeroAreaPolygonUrl}`,
        async () => {
          server.methods.getFloodZonesByPolygon = () => zone1GetByPolygonResponse
          server.methods.getPsoContactsByPolygon = async () => optInPSOContactResponse
          const options = { method: 'GET', url: fzrBuffedZeroAreaPolygonUrl }
          const response = await server.inject(options)
          Code.expect(response.statusCode).to.equal(302)
          zeroAreaPolygonsTestCount++
        }
      )
    }
  )

  lab.test('zeroAreaPolygonsTestCount should equal 10', async () => {
    Code.expect(zeroAreaPolygonsTestCount).to.equal(20)
  })
})
