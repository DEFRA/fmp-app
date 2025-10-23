const { getProduct1 } = require('../getProduct1')
jest.mock('../getEAMapsToken')

const axios = require('axios')
jest.mock('axios')
const SCALE_2500 = 2500
const validPostResponse = { data: { results: [{ paramName: 'pdfFile', value: { url: 'http://product1url' } }] } }
const emptyUrlPostResponse = { data: { results: [{ paramName: 'pdfFile', value: { url: '' } }] } }
const errorPostResponse = { data: { results: [{ paramName: 'error', value: 'there was an error' }] } }
const p1Params = ['okjhij~@otghgd{@_r{bzA??~q{bzA~q{bzA??_r{bzA', 'abc123', SCALE_2500, false, '1']

describe('getProduct1', () => {
  it('should return a pdf', async () => {
    axios.post.mockResolvedValue(validPostResponse)
    axios.get.mockResolvedValue({ data: 'PDF_DATA' })
    const response = await getProduct1(...p1Params)
    expect(response).toEqual('PDF_DATA')
  })

  it('should throw an error if post returns a bad response', async () => {
    axios.post.mockResolvedValue({ data: 'NOT AN ARRAY' })
    try {
      const response = await getProduct1(...p1Params)
      expect(response).toEqual('this line should not be reached')
    } catch (error) {
      expect(error).toEqual(new Error('unexpected results from eaMaps generate pdf'))
    }
  })

  it('should throw an error if post returns an error response', async () => {
    axios.post.mockResolvedValue(errorPostResponse)
    try {
      const response = await getProduct1(...p1Params)
      expect(response).toEqual('this line should not be reached')
    } catch (error) {
      expect(error).toEqual(new Error('there was an error'))
    }
  })

  it('should throw an error if post returns an empty url', async () => {
    axios.post.mockResolvedValue(emptyUrlPostResponse)
    try {
      const response = await getProduct1(...p1Params)
      expect(response).toEqual('this line should not be reached')
    } catch (error) {
      expect(error).toEqual(new Error('The eaMaps Product 1 service failed to return a url'))
    }
  })
})
