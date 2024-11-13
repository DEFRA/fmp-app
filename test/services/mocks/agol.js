const agol = require('../../../server/services/agol')
const restoreEsriRequest = agol.esriRequest

const clearCaches = () => {
  delete require.cache[require.resolve('../../../server/services/is-england')]
  delete require.cache[require.resolve('../../../server/services/pso-contact')]
  delete require.cache[require.resolve('../../../server/services/agol/getContacts')]
  delete require.cache[require.resolve('../../../server/services/agol/getFloodZones')]
  delete require.cache[require.resolve('../../../server/services/flood-zones-by-polygon.js')]
  delete require.cache[require.resolve('../../../server/services/pso-contact-by-polygon.js')]
}

const mockEsriRequest = (result = [{}]) => {
  clearCaches()
  agol.esriRequest = async () => (result)
}

const mockEsriRequestWithThrow = (result = [{}]) => {
  clearCaches()
  agol.esriRequest = async () => { throw new Error('mocked error') }
}

const stopMockingEsriRequests = () => {
  agol.esriRequest = restoreEsriRequest
}

module.exports = { mockEsriRequest, mockEsriRequestWithThrow, stopMockingEsriRequests }
