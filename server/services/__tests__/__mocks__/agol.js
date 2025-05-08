const agol = require('../../agol')
jest.mock('../../../services/agol')

const mockEsriRequest = (result = [{}]) => {
  const mockImplementation = async () => result
  agol.esriFeatureRequestByIntersectArea.mockImplementation(mockImplementation)
  agol.esriFeatureRequest.mockImplementation(mockImplementation)
  agol.esriLayerRequest.mockImplementation(mockImplementation)
}

const mockEsriRequestWithThrow = () => {
  const mockImplementation = async () => { throw new Error('mocked error') }
  agol.esriFeatureRequestByIntersectArea.mockImplementation(mockImplementation)
  agol.esriFeatureRequest.mockImplementation(mockImplementation)
  agol.esriLayerRequest.mockImplementation(mockImplementation)
}

const stopMockingEsriRequests = () => {
  jest.resetAllMocks()
}

module.exports = {
  mockEsriRequest,
  mockEsriRequestWithThrow,
  stopMockingEsriRequests
}
