const createServer = require('../../server')

describe('Triage Page', () => {
  let server
  const elements = {}

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
    const { payload } = await server.inject({ method: 'GET', url: '/triage' })
    document.body.innerHTML = payload
    Object.assign(elements, {
      continue: document.getElementById('continue-button')
    })
    // We have to assignClickEvents here as they dont get assigned by assigning innerHTML
    require('../../client/js/modules/triage')
  })

  afterAll(async () => {
    await server.stop()
  })

  it('should have the heading "What flood information do you need?"', async () => {
    const heading = document.querySelector('.govuk-heading-xl')
    expect(heading.textContent).toBe('What flood information do you need?')
  })

  it('should have a continue button that redirects to about-map', async () => {
    expect(elements.continue.href).toBe(`${document.location.href}about-map`)
  })

  const radioItems = [
    {
      id: 'about-map',
      local: true,
      expectedLocation: 'about-map'
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
    }
  ]
  radioItems.forEach(({ id, expectedLocation, local }) => {
    it(`should update continue button to ${expectedLocation} when ${id} is clicked`, async () => {
      const radioItem = document.getElementById(id)
      radioItem.click(radioItem)
      expect(elements.continue.href).toBe(local ? `${document.location.href}${expectedLocation}` : expectedLocation)
    })
  })
})
