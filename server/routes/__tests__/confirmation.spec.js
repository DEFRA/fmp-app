const {
  submitGetRequest,
  getServer
} = require('../../__test-helpers__/server')

const url = '/confirmation'

describe('confirmation', () => {
  beforeEach(() => {
    getServer().methods.getPsoContactsByPolygon = () => {
      return {
        EmailAddress: 'psoContact@example.com',
        AreaName: 'Yorkshire',
        LocalAuthorities: 'Ryedale'
      }
    }
  })

  it('Should return content correctly based on flood zone 1', async () => {
    const response = await submitGetRequest({ url: `${url}?recipientemail=test@test.com&applicationReferenceNumber=12345&polygon=[[111,111],[111,112],[112,112],[112,111],[111,111]]&floodZone=1` })
    expect(response.result).toMatchSnapshot()
  })

  it('Should return content correctly based on flood zone 3', async () => {
    const response = await submitGetRequest({ url: `${url}?recipientemail=test@test.com&applicationReferenceNumber=12345&polygon=[[111,111],[111,112],[112,112],[112,111],[111,111]]&floodZone=3` })
    expect(response.result).toMatchSnapshot()
  })

  const invalidUrls = [
    '/confirmation',
    '/confirmation?applicationReferenceNumber=12345&polygon=[[111,111],[111,112],[112,112],[112,111],[111,111]]&floodZone=3',
    '/confirmation?recipientemail=test@test.com&polygon=[[111,111],[111,112],[112,112],[112,111],[111,111]]&floodZone=3',
    '/confirmation?recipientemail=test@test.com&applicationReferenceNumber=12345&floodZone=3',
    '/confirmation?recipientemail=test@test.com&applicationReferenceNumber=12345&polygon=[[111,111],[111,112],[112,112],[112,111],[111,111]]'
  ]
  invalidUrls.forEach((invalidUrl) => {
    it('Should error on invalid query string', async () => {
      await submitGetRequest({ url: invalidUrl }, '', 400)
    })
  })

  it('Should error on server method error', async () => {
    getServer().methods.getPsoContactsByPolygon = () => {
      throw new Error()
    }
    await submitGetRequest({ url: `${url}?recipientemail=test@test.com&applicationReferenceNumber=12345&polygon=[[111,111],[111,112],[112,112],[112,111],[111,111]]&floodZone=1` }, 'Sorry, there is a problem with the page you requested', 500)
  })
})
