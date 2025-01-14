const {
  submitGetRequest,
  submitPostRequest
} = require('../../__test-helpers__/server')

const url = '/triage'

describe('Triage Page', () => {
  it('should have the heading "What flood information do you need?"', async () => {
    const response = await submitGetRequest({ url }, 'What flood information do you need?')
    document.body.innerHTML = response.payload
    expect(document.querySelector('title').textContent).toContain('What flood information do you need - Flood map for planning - GOV.UK')
  })

  const radioItems = [
    {
      id: 'about-map',
      expectedLocation: '/about-map'
    },
    {
      id: 'buy-sell',
      expectedLocation: 'https://www.gov.uk/check-long-term-flood-risk'
    },
    {
      id: 'flood-history',
      expectedLocation: 'https://www.gov.uk/request-flooding-history'
    },
    {
      id: 'insurance',
      expectedLocation: 'https://www.gov.uk/check-long-term-flood-risk'
    },
    {
      id: 'other',
      expectedLocation: 'https://www.gov.uk/browse/environment-countryside/flooding-extreme-weather'
    },
    {
      id: '',
      expectedLocation: '/about-map'
    },
    {
      expectedLocation: '/about-map'
    }
  ]
  radioItems.forEach(({ id, expectedLocation }) => {
    it(`should update continue button to ${expectedLocation} when ${id} is clicked`, async () => {
      const options = {
        url,
        payload: {
          triageOptions: id
        }
      }
      const response = await submitPostRequest(options)
      expect(response.headers.location).toBe(expectedLocation)
    })
  })
})
