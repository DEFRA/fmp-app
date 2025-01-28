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

const mockEsriRestRequest = (result = [{}]) => {
  agol.esriRestRequest.mockImplementation(async () => {
    return result
  })
}

const mockEsriRestRequestWithThrow = () => {
  agol.esriRestRequest.mockImplementation(async () => {
    throw new Error('mocked error')
  })
}

module.exports = {
  mockEsriRequest,
  mockEsriRequestWithThrow,
  stopMockingEsriRequests,
  mockEsriRestRequest,
  mockEsriRestRequestWithThrow
}
