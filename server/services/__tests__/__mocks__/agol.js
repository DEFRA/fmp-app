const agol = require('../../agol')
jest.mock('../../../services/agol')

const mockEsriRequest = (result = [{}]) => {
  const mockImplementation = async () => result
  agol.esriRequestByIntersectArea.mockImplementation(mockImplementation)
  agol.esriRequest.mockImplementation(mockImplementation)
}

const mockEsriRequestWithThrow = () => {
  const mockImplementation = async () => {
    throw new Error('mocked error')
  }
  agol.esriRequestByIntersectArea.mockImplementation(mockImplementation)
  agol.esriRequest.mockImplementation(mockImplementation)
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
