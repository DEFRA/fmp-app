const { assertCopy } = require('../../__test-helpers__/copy')
const {
  submitGetRequest,
  submitPostRequest,
  getServer
} = require('../../__test-helpers__/server')
const { mockPolygons } = require('../../services/__tests__/__mocks__/floodZoneByPolygonMock')
const { getCentreOfPolygon, encodePolygon } = require('../../services/shape-utils')
jest.mock('../../services/agol/getContacts')
jest.mock('../../services/address')
const wreck = require('@hapi/wreck')
const user = {
  fullName: 'John Smith',
  email: 'john.smith@email.com'
}
const url = '/check-your-details'
const { encode } = require('@mapbox/polyline')
let postSpy

describe('Check your details page', () => {
  beforeEach(() => {
    postSpy = jest.spyOn(wreck, 'post').mockImplementation(() => {
      return {
        payload: {
          applicationReferenceNumber: '12345',
          nextTask: 'SEND_CONFIRMATION_EMAIL'
        }
      }
    })
  })

  describe('GET', () => {
    const floodZoneGets = [
      { polygon: mockPolygons.fz1_only, floodZone: '1' },
      { polygon: mockPolygons.fz2_only, floodZone: '2' },
      { polygon: mockPolygons.fz3_only, floodZone: '3' }
    ]
    const encodedPolygon = encode([[111, 111], [111, 112], [112, 112], [112, 111], [111, 111]])
    floodZoneGets.forEach(({ polygon, floodZone }) => {
      it(`Happy get request for a flood zone ${floodZone} information`, async () => {
        const response = await submitGetRequest({ url: `${url}?polygon=${polygon}&fullName=${user.fullName}&recipientemail=${user.email}` }, 'Check your details before requesting your data')
        document.body.innerHTML = response.payload
        assertCopy('title', 'Check your details before requesting your data - Flood map for planning - GOV.UK')
        assertCopy('.govuk-summary-list__row > dd.govuk-summary-list__value', user.fullName)
        assertCopy('.govuk-summary-list__row:nth-child(2) > dd.govuk-summary-list__value', user.email)
        assertCopy('.govuk-summary-list__row:nth-child(4) > dd.govuk-summary-list__value', floodZone)
      })
    })
    const longFullName = 'test'.repeat(51)
    const tests = [
      [
        'Should serve contact view with error message if fullname in url is > 200 chars',
        `${url}?polygon=${mockPolygons.fz1_only}&fullName=${longFullName}&recipientemail=${user.email}`
      ], [
        'Should serve contact view with error message if fullname is missing',
        `${url}?polygon=${mockPolygons.fz1_only}&recipientemail=${user.email}`
      ], [
        'Should serve contact view with error message if recipientemail is missing',
        `${url}?polygon=${mockPolygons.fz1_only}&fullName=${user.fullName}`
      ], [
        'Should serve contact view with error message if fullname in url is > 200 chars, url polygon encoded',
        `${url}?encodedPolygon=${encodedPolygon}&fullName=${longFullName}&recipientemail=${user.email}`
      ], [
        'Should serve contact view with error message if fullname is missing, url polygon encoded',
        `${url}?encodedPolygon=${encodedPolygon}&recipientemail=${user.email}`
      ], [
        'Should serve contact view with error message if recipientemail is missing, url polygon encoded',
        `${url}?encodedPolygon=${encodedPolygon}&fullName=${user.fullName}`
      ]
    ]
    tests.forEach(([description, checkYourDetailsUrl]) => {
      it(description, async () => {
        const response = await submitGetRequest({ url: checkYourDetailsUrl }, 'Order your flood risk data')
        expect(response.result).toMatchSnapshot()
      })
    })
  })

  describe('POST', () => {
    // Makes a first request with no cookie
    const postTests = [
      {
        description: 'Happy post: request with p4request made with no p4Request cookie',
        payload: {
          recipientemail: user.email,
          fullName: user.fullName,
          polygon: mockPolygons.fz1_only
        },
        p4Cookie: {},
        expectedAppRef: '12345',
        expectedZoneNumber: '1',
        expectedWreckCalls: 1
      },
      {
        description: 'Happy post: request with p4request made with no p4Request cookie and no LA Returned',
        payload: {
          recipientemail: user.email,
          fullName: user.fullName,
          polygon: mockPolygons.fz1_only_no_la
        },
        expectedAppRef: '12345',
        expectedZoneNumber: '1',
        expectedWreckCalls: 1
      },
      {
        description: 'Happy post: Attempts a 2nd duplicate request and wreck should not be called to make p4',
        payload: {
          recipientemail: user.email,
          fullName: user.fullName,
          polygon: mockPolygons.fz1_only
        },
        p4Cookie: { [mockPolygons.fz1_only]: '12345' },
        expectedAppRef: '12345',
        expectedZoneNumber: '1',
        expectedWreckCalls: 0
      },
      {
        description: 'Happy post: Attempts a 2nd non duplicate request and wreck should be called to make p4',
        payload: {
          recipientemail: user.email,
          fullName: user.fullName,
          polygon: mockPolygons.fz2_only
        },
        p4Cookie: { [mockPolygons.fz1_only]: '12346' },
        expectedAppRef: '12345',
        expectedZoneNumber: '2',
        expectedWreckCalls: 1
      }
    ]

    postTests.forEach(({ description, payload, p4Cookie, expectedAppRef, expectedZoneNumber, expectedWreckCalls }) => {
      it(description, async () => {
        const options = { url, payload }

        getServer().ext('onPreHandler', (request, h) => {
          request.state = { p4Request: p4Cookie }
          return h.continue
        })
        const { polygon } = payload
        const { x, y } = getCentreOfPolygon(polygon)
        const queryParams = {
          applicationReferenceNumber: expectedAppRef,
          encodedPolygon: encodePolygon(polygon),
          recipientemail: payload.recipientemail,
          floodZone: expectedZoneNumber
        }
        const llfa = payload.polygon === mockPolygons.fz1_only_no_la ? '' : 'North Yorkshire'

        const response = await submitPostRequest(options)
        expect(response.headers.location).toEqual(`/confirmation?${new URLSearchParams(queryParams).toString()}`)
        expect(response.request.state.p4Request).toEqual(p4Cookie)
        expect(wreck.post).toHaveBeenCalledTimes(expectedWreckCalls)
        if (expectedWreckCalls) {
          const expectedPayload = JSON.stringify({
            requestType: 'internal',
            name: user.fullName,
            customerEmail: user.email,
            x,
            y,
            polygon: `[${polygon}]`,
            floodZone: expectedZoneNumber,
            plotSize: '0',
            areaName: 'Yorkshire',
            psoEmailAddress: 'neyorkshire@environment-agency.gov.uk',
            llfa,
            postcode: 'M1 1AA'
          })

          expect(postSpy).toHaveBeenCalledWith('http://dummyuri/order-product-four', { json: true, payload: expectedPayload })
        }
      })
    })
    // Sad paths
    // Wreck returns an error
    it('Sad: Wreck returns an error for p4Request', async () => {
      const options = {
        url,
        payload: {
          recipientemail: 'john.smith@email.com',
          fullName: 'John Smith',
          polygon: mockPolygons.fz2_only
        }
      }
      wreck.post.mockImplementation(() => {
        throw new Error()
      })
      const response = await submitPostRequest(options)
      expect(response.headers.location).toEqual(`/order-not-submitted?encodedPolygon=${encodePolygon(options.payload.polygon)}`)
    })
  })
})
