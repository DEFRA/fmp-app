const agol = require('../../agol')
jest.mock('../../../services/agol')

const mockEsriRequest = (result = [{}]) => {
  const mockImplementation = async () => result
  agol.esriRequestByIntersectArea.mockImplementation(mockImplementation)
  agol.esriFeatureRequest.mockImplementation(mockImplementation)
}

const mockEsriRequestWithThrow = () => {
  const mockImplementation = async () => {
    throw new Error('mocked error')
  }
  agol.esriRequestByIntersectArea.mockImplementation(mockImplementation)
  agol.esriFeatureRequest.mockImplementation(mockImplementation)
}

const stopMockingEsriRequests = () => {
  jest.resetAllMocks()
}

const mockEsriRestRequest = (result = [{}]) => {
  agol.esriLayerRequest.mockImplementation(async () => {
    return result
  })
}

const mockEsriRestRequestWithThrow = () => {
  agol.esriLayerRequest.mockImplementation(async () => {
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
