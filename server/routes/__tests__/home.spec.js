const { submitGetRequest } = require('../../__test-helpers__/server')
const { expectedContent } = require('../../__test-helpers__/copy')
const url = '/'
describe('home route', () => {
  let response

  beforeEach(async () => {
    response = await submitGetRequest({ url }, 'Get flood risk information for planning in England')
    document.body.innerHTML = response.payload
  })

  it('should match snapshot', () => {
    expect(response.result).toMatchSnapshot()
  })

  it('should return a 200 status code', async () => {
    expect(response.statusCode).toEqual(200)
  })

  it('should contain a link to when-you-need-a-flood-risk-assessment', async () => {
    expectedContent('a[href="https://www.gov.uk/guidance/flood-risk-assessment-for-planning-applications#when-you-need-a-flood-risk-assessment"]'
      , 'Find out more about flood risk assessments for planning permission'
    )
  })

  it('should have a footer that contains OS link titled Ordance Survey (OS)', async () => {
    expectedContent('a[href="https://www.ordnancesurvey.co.uk/"]', 'Ordnance Survey(OS)')
    expectedContent('a[href="/os-terms"]', 'Ordnance Survey terms and conditions')
    expectedContent('.govuk-list.govuk-list--bullet', 'download a printable flood map for planning')
    expectedContent('.govuk-list.govuk-list--bullet', 'request flood risk data')
    expectedContent('footer.govuk-footer', 'AC0000807064')
  })
})
