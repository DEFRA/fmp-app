const agol = require('../../../server/services/agol')
const restoreEsriRequest = agol.esriRequest

const mockEsriRequest = (result = [{}]) => {
  delete require.cache[require.resolve('../../../server/services/is-england')]
  delete require.cache[require.resolve('../../../server/services/pso-contact')]
  delete require.cache[require.resolve('../../../server/services/agol/getContacts')]
  agol.esriRequest = agol.esriRequest = async () => (result)
}

const stopMockingEsriRequests = () => {
  agol.esriRequest = restoreEsriRequest
}

module.exports = { mockEsriRequest, stopMockingEsriRequests }
