const createServer = require('../../server')

describe('About Map Page', () => {
  const values = { server: undefined }

  beforeAll(async () => {
    values.server = await createServer()
    await values.server.initialize()
    values.response = await values.server.inject({ method: 'GET', url: '/about-map' })
    document.body.innerHTML = values.response.payload
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
})
