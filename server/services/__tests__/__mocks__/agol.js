const agol = require('../../agol')
jest.mock('../../../services/agol')

const mockEsriRequest = (result = [{}]) => {
  agol.esriRequest.mockImplementation(async () => {
    return result
  })
}

const mockEsriRequestWithThrow = () => {
  agol.esriRequest.mockImplementation(async () => {
    throw new Error('mocked error')
  })
}

const stopMockingEsriRequests = () => {
  jest.resetAllMocks()
}

module.exports = { mockEsriRequest, mockEsriRequestWithThrow, stopMockingEsriRequests }
