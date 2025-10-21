const {
  submitGetRequest,
  submitPostRequest,
  submitPostRequestExpectHandledError,
  getServer
} = require('../../__test-helpers__/server')
const constants = require('../../constants')
const { encode } = require('@mapbox/polyline')

const polygon = '[[111, 111], [111, 112], [112, 112], [112, 111], [111, 111]]'
const encodedPolygon = encode([[111, 111], [111, 112], [112, 112], [112, 111], [111, 111]])
const queryParams = [`polygon=${polygon}`, `encodedPolygon=${encodedPolygon}`]
const url = constants.routes.CONTACT

const p4CustomerCookie = {
  fullName: 'John Smith',
  recipientemail: 'john.smith@test.com'
}

describe('contact', () => {
  describe('GET', () => {
    queryParams.forEach((queryParam) => {
      it(`Should get contact page if ${queryParam} is present, with a backlink to results`, async () => {
        const response = await submitGetRequest({ url: `${url}?${queryParam}` })
        expect(response.result).toMatchSnapshot()
      })
      it('Should get contact page if polygon is present, with a backlink to next-steps', async () => {
        const response = await submitGetRequest({
          url: `${url}?${queryParam}`,
          headers: {
            referer: `http://localhost:3000/next-steps?${queryParam}`
          }
        })
        expect(response.result).toMatchSnapshot()
      })
      it('Should get contact page with user name and email if cookie present', async () => {
        getServer().ext('onPreHandler', (request, h) => {
          request.state = {
            p4Customer: p4CustomerCookie
          }
          return h.continue
        })
        const response = await submitGetRequest({ url: `${url}?${queryParam}` })
        expect(response.result).toMatchSnapshot()
      })
    })
    it('Should error if no polygon is present', async () => {
      const response = await submitGetRequest({ url: `${url}` }, '', 500)
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
          polygon: polygon
        }
      }
      await submitPostRequest(options)
    })
    it('Should return contact view with error message if invalid email', async () => {
      const options = {
        url,
        payload: {
          recipientemail: 'sdf',
          fullName: 'John Smith',
          polygon: polygon
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
          polygon: polygon
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
          polygon: polygon
        }
      }
      const response = await submitPostRequestExpectHandledError(options, 'Enter your full name')
      expect(response.result).toMatchSnapshot()
    })

    it('Should return contact view with error message if name contains an emoji', async () => {
      const options = {
        url,
        payload: {
          recipientemail: 'test@test.com',
          fullName: 'John😂Smith',
          polygon: polygon
        }
      }
      const response = await submitPostRequestExpectHandledError(options, '>Emojis are not allowed in the name field')
      expect(response.result).toMatchSnapshot()
    })

    it('Should return contact view with error message if email contains an emoji', async () => {
      const options = {
        url,
        payload: {
          recipientemail: 'test😂@test.com',
          fullName: 'John Smith',
          polygon: polygon
        }
      }
      const response = await submitPostRequestExpectHandledError(options, '>Emojis are not allowed in the email address')
      expect(response.result).toMatchSnapshot()
    })

    it('Should return contact view with error message if fullname is > 200 chars', async () => {
      const fullName = 'test'.repeat(51)
      const options = {
        url,
        payload: {
          recipientemail: 'test@test.com',
          fullName,
          polygon: polygon
        }
      }
      const response = await submitPostRequestExpectHandledError(options, '>Your full name must be less than 200 characters long')
      expect(response.result).toMatchSnapshot()
    })
  })
})
