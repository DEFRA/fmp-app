const agol = require('../../../server/services/agol')
const restoreEsriRequest = agol.esriRequest

const mockEsriRequest = (result = [{}]) => {
  delete require.cache[require.resolve('../../../server/services/is-england')]
  delete require.cache[require.resolve('../../../server/services/pso-contact')]
  delete require.cache[require.resolve('../../../server/services/agol/getContacts')]
  delete require.cache[require.resolve('../../../server/services/agol/getFloodZones')]
  delete require.cache[require.resolve('../../../server/services/flood-zones-by-polygon.js')]
  delete require.cache[require.resolve('../../../server/services/pso-contact-by-polygon.js')]
  agol.esriRequest = agol.esriRequest = async () => (result)
}

const stopMockingEsriRequests = () => {
  agol.esriRequest = restoreEsriRequest
}

module.exports = { mockEsriRequest, stopMockingEsriRequests }
