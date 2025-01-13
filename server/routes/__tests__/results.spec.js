const createServer = require('../../../server')

describe('Results Page', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
    const { payload } = await server.inject({ method: 'GET', url: '/results' })
    document.body.innerHTML = payload
  })

  afterAll(async () => {
    await server.stop()
  })

  it('should have the heading "Results - Placeholder"', async () => {
    const heading = document.querySelector('.govuk-heading-xl')
    expect(heading.textContent).toBe('Results - Placeholder')
  })
})
