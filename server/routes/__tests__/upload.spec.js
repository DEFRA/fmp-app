const constants = require('../../constants')
const url = constants.routes.UPLOAD
const { submitGetRequest } = require('../../__test-helpers__/server')

describe('Upload route', () => {
  describe('GET', () => {
    it('should return the upload view', async () => {
      await submitGetRequest({ url }, 'Upload a boundary')
    })
  })
})
