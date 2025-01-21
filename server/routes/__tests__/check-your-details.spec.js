const { getServer } = require('../../../.jest/setup')
const {
  submitGetRequest,
  submitPostRequest
} = require('../../__test-helpers__/server')
const mockPolygons = require('../../services/__data__/mockPolygons.json')

jest.mock('../../services/agol/getFloodZones')
jest.mock('../../services/riskAdmin/isRiskAdminArea')
jest.mock('../../services/agol/getContacts')
jest.mock('../../services/address')
jest.mock('@hapi/wreck')
const wreck = require('@hapi/wreck')
const user = {
  fullName: 'John Smith',
  email: 'john.smith@email.com'
}

const url = '/check-your-details'

describe('Check your details page', () => {
  beforeEach(() => {
    wreck.post.mockResolvedValue({
      payload: {
        applicationReferenceNumber: '12345',
        nextTask: 'SEND_CONFIRMATION_EMAIL'
      }
    })
  })
  describe('GET', () => {
    const floodZoneGets = [
      { polygon: mockPolygons.fz1_only, floodZone: '1' },
      { polygon: mockPolygons.fz2_only, floodZone: '2' },
      { polygon: mockPolygons.fz3_only, floodZone: '3' }
    ]
    floodZoneGets.forEach(({ polygon, floodZone }) => {
      it(`Happy get request for a flood zone ${floodZone} information`, async () => {
        const response = await submitGetRequest({ url: `${url}?polygon=${polygon}&fullName=${user.fullName}&recipientemail=${user.email}` }, 'Check your details before requesting your data')
        document.body.innerHTML = response.payload
        expect(document.querySelector('title').textContent).toContain('Check your details - Flood map for planning - GOV.UK')
        expect(document.querySelector('.govuk-summary-list__row > dd.govuk-summary-list__value').textContent).toContain(user.fullName)
        expect(document.querySelector('.govuk-summary-list__row:nth-child(2) > dd.govuk-summary-list__value').textContent).toContain(user.email)
        expect(document.querySelector('.govuk-summary-list__row:nth-child(4) > dd.govuk-summary-list__value').textContent).toContain(floodZone)
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

        const queryParams = {
          applicationReferenceNumber: expectedAppRef,
          polygon: payload.polygon,
          recipientemail: payload.recipientemail,
          zoneNumber: expectedZoneNumber
        }

        const response = await submitPostRequest(options)
        expect(response.headers.location).toEqual(`/confirmation?${new URLSearchParams(queryParams).toString()}`)
        expect(response.request.state.p4Request).toEqual(p4Cookie)
        expect(wreck.post).toHaveBeenCalledTimes(expectedWreckCalls)
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
        console.log('in wreck post mock')
        throw new Error()
      })
      const response = await submitPostRequest(options)
      expect(response.headers.location).toEqual(`/order-not-submitted?polygon=${options.payload.polygon}`)
    })
  })
})
