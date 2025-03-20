const {
  submitGetRequest,
  submitPostRequest,
  submitPostRequestExpectHandledError
} = require('../../__test-helpers__/server')
const constants = require('../../constants')

const url = constants.routes.CONTACT

describe('contact', () => {
  describe('GET', () => {
    it('Should return contact if polygon is present', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=[[111,111],[111,112],[112,112],[112,111],[111,111]]` })
      expect(response.result).toMatchSnapshot()
    })
    it('Should error if no polygon is present', async () => {
      const response = await submitGetRequest({ url: `${url}` }, '', 400)
      expect(response.result).toMatchSnapshot()
    })
  })
  describe('POST', () => {
    it('Should redirect to check-your-details with correct query string if all fields are valid', async () => {
      const options = {
        url,
        payload: {
          recipientemail: 'test@test.com',
          fullName: 'John Smith',
          polygon: '[[111,111],[111,112],[112,112],[112,111],[111,111]]'
        }
      }
      const response = await submitPostRequest(options)
      expect(response.headers.location).toEqual('/check-your-details?polygon=[[111,111],[111,112],[112,112],[112,111],[111,111]]&fullName=John Smith&recipientemail=test@test.com')
    })
    it('Should return contact view with error message if invalid email', async () => {
      const options = {
        url,
        payload: {
          recipientemail: 'sdf',
          fullName: 'John Smith',
          polygon: '[[111,111],[111,112],[112,112],[112,111],[111,111]]'
        }
      }
      const response = await submitPostRequestExpectHandledError(options, 'Enter an email address in the correct format, like name@example.com')
      expect(response.result).toMatchSnapshot()
    })
    it('Should return contact view with error message if blank email', async () => {
      const options = {
        url,
        payload: {
          recipientemail: '',
          fullName: 'John Smith',
          polygon: '[[111,111],[111,112],[112,112],[112,111],[111,111]]'
        }
      }
      const response = await submitPostRequestExpectHandledError(options, 'Enter an email address in the correct format, like name@example.com')
      expect(response.result).toMatchSnapshot()
    })
    it('Should return contact view with error message if blank name', async () => {
      const options = {
        url,
        payload: {
          recipientemail: 'test@test.com',
          fullName: '',
          polygon: '[[111,111],[111,112],[112,112],[112,111],[111,111]]'
        }
      }
      const response = await submitPostRequestExpectHandledError(options, 'Enter your full name')
      expect(response.result).toMatchSnapshot()
    })
    it('Should return contact view with error message if invalid name', async () => {
      const options = {
        url,
        payload: {
          recipientemail: 'test@test.com',
          fullName: 's',
          polygon: '[[111,111],[111,112],[112,112],[112,111],[111,111]]'
        }
      }
      const response = await submitPostRequestExpectHandledError(options, 'Enter your full name')
      expect(response.result).toMatchSnapshot()
    })
  })
})
