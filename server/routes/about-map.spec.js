const createServer = require('../../server')

describe('About Map Page', () => {
  const values = { server: undefined }

  beforeAll(async () => {
    values.server = await createServer()
    await values.server.initialize()
    values.response = await values.server.inject({ method: 'GET', url: '/about-map' })
    document.body.innerHTML = values.response.payload
    require('../../client/js/modules/about-map')
  })

  afterAll(async () => {
    await values.server.stop()
  })

  it('should respond with 200', async () => {
    expect(values.response.statusCode).toBe(200)
  })

  it('should have the heading "Changes to flood data"', async () => {
    const heading = document.querySelector('.govuk-heading-xl')
    expect(heading.textContent).toBe('Changes to flood data')
  })

  it('should not have any cookies set', async () => {
    expect(document.cookie).toBe('')
  })

  it('should toggle Skip-changes-to-flood-data cookie if dont-show-again is clicked', async () => {
    const dontShowAgain = document.getElementById('dont-show-again')
    dontShowAgain.click()
    expect(document.cookie).toBe('Skip-changes-to-flood-data=true')
    dontShowAgain.click()
    expect(document.cookie).toBe('')
  })

  it('should redirect to /location if Skip-changes-to-flood-data cookie is set to true ', async () => {
    const headers = { cookie: 'Skip-changes-to-flood-data=true;' }
    const response = await values.server.inject({
      method: 'GET',
      url: '/about-map',
      headers
    })
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/location')
  })
})
