const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')
const url = '/'
describe('home route', () => {
  it('should return a 200 status code', async () => {
    const response = await submitGetRequest({ url }, 'Get flood risk information for planning in England')
    expect(response.statusCode).toEqual(200)
    assertCopy('.govuk-heading-xl', 'Get flood risk information for planning in England')
  })

  it('should contain a link to when-you-need-a-flood-risk-assessment', async () => {
    const { payload } = await submitGetRequest({ url }, 'Get flood risk information for planning in England')
    document.body.innerHTML = payload
    assertCopy('a[href="https://www.gov.uk/guidance/flood-risk-assessment-for-planning-applications#when-you-need-an-assessment"]'
      , 'Find out more about flood risk assessments for planning permission'
    )
  })
})
