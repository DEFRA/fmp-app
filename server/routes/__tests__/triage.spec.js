const {
  submitGetRequest,
  submitPostRequest,
  submitPostRequestExpectHandledError
} = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')

const constants = require('../../constants')

const url = constants.routes.TRIAGE

describe('Triage Page', () => {
  it('should have the heading "What flood information do you need?"', async () => {
    const response = await submitGetRequest({ url }, 'What flood information do you need?')
    document.body.innerHTML = response.payload
    expect(document.querySelector('title').textContent).toContain('What flood information do you need - Flood map for planning - GOV.UK')
  })

  const radioItems = [
    {
      id: 'location',
      expectedLocation: '/location',
      expectedLabel: 'For planning purposes or scoping a site',
      expectedHint: 'You will be taken to the flood map for planning service'
    },
    {
      id: 'buy-sell',
      expectedLocation: 'https://www.gov.uk/check-long-term-flood-risk',
      expectedLabel: 'For buying, selling or valuing a property',
      expectedHint: 'You will be taken to the check your long term flood risk service'
    },
    {
      id: 'flood-history',
      expectedLocation: 'https://www.gov.uk/request-flooding-history',
      expectedLabel: 'To find out if your property is in an area that has flooded',
      expectedHint: 'You will be taken to information on how to request a flood history report'

    },
    {
      id: 'insurance',
      expectedLocation: 'https://www.gov.uk/check-long-term-flood-risk',
      expectedLabel: 'For insurance purposes, to find out if I am at risk of flooding',
      expectedHint: 'You will be taken to the check your long term flood risk service'
    },
    {
      id: 'other',
      expectedLocation: 'https://www.gov.uk/browse/environment-countryside/flooding-extreme-weather',
      expectedLabel: 'My reason is not listed here',
      expectedHint: 'Find other flood information on GOV.UK'
    }
  ]
  radioItems.forEach(({ id, expectedLocation, expectedLabel, expectedHint }) => {
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

    it(`Item ${id} should contain label ${expectedLabel} and hint: ${expectedHint}`, async () => {
      const response = await submitGetRequest({ url }, 'What flood information do you need?')
      document.body.innerHTML = response.payload
      assertCopy(`[for=${id}]`, expectedLabel)
      assertCopy(`#${id}-item-hint`, expectedHint)
    })
  })

  it('Should display error message if no selection', async () => {
    const options = {
      url,
      payload: {
        triageOptions: ''
      }
    }
    await submitPostRequestExpectHandledError(options, 'Please select an option to continue')
  })

  it('Should display error message if missing payload value', async () => {
    const options = {
      url,
      payload: {}
    }
    await submitPostRequestExpectHandledError(options, 'Please select an option to continue')
  })
})
