const { getProduct1 } = require('../../services/eaMaps/getProduct1')
const { submitPostRequest } = require('../../__test-helpers__/server')
const fs = require('fs')
jest.mock('../../services/eaMaps/getProduct1')
const url = '/product-1'

describe('product-1 request', () => {
  it('Should accept valid parameters and return valid pdf file', async () => {
    getProduct1.mockImplementation(() => {
      return fs.createReadStream('./server/routes/__data__/product-1.pdf')
    })
    const options = {
      url,
      payload: {
        reference: 'test',
        scale: 2500,
        polygon: '[[111,111],[111,112],[112,112],[112,111],[111,111]]',
        isRiskAdminArea: 'true',
        floodZone: '1'
      }
    }
    const response = await submitPostRequest(options, 200)
    expect(response.headers['content-type']).toEqual('application/pdf')
    expect(response.headers['content-disposition']).toContain('attachment; filename=flood-map-planning-')
  })

  it('Should accept missing reference, and return valid pdf file', async () => {
    getProduct1.mockImplementation(() => {
      return fs.createReadStream('./server/routes/__data__/product-1.pdf')
    })
    const options = {
      url,
      payload: {
        reference: '',
        scale: 2500,
        polygon: '[[111,111],[111,112],[112,112],[112,111],[111,111]]',
        isRiskAdminArea: 'true',
        floodZone: '1'
      }
    }
    const response = await submitPostRequest(options, 200)
    expect(response.headers['content-type']).toEqual('application/pdf')
    expect(response.headers['content-disposition']).toContain('attachment; filename=flood-map-planning-')
  })

  it('Should return error if product-1 generation fails', async () => {
    getProduct1.mockImplementation(() => {
      throw new Error()
    })
    const options = {
      url,
      payload: {
        reference: 'test',
        scale: 2500,
        polygon: '[[111,111],[111,112],[112,112],[112,111],[111,111]]',
        isRiskAdminArea: 'true',
        floodZone: '1'
      }
    }
    await submitPostRequest(options, 500)
  })

  it('Should fail validation for invalid query parameters', async () => {
    const options = {
      url,
      payload: {}
    }
    await submitPostRequest(options, 400)
  })

  it('Should fail validation for invalid scale value', async () => {
    const options = {
      url,
      payload: {
        reference: 'test',
        scale: 1,
        polygon: '[[111,111],[111,112],[112,112],[112,111],[111,111]]',
        isRiskAdminArea: 'true',
        floodZone: '1'
      }
    }
    await submitPostRequest(options, 400)
  })
})
