const agol = require('../../../server/services/agol')
const restoreEsriRequest = agol.esriRequest

const mockEsriRequest = (result = [{}]) => {
  delete require.cache[require.resolve('../../../server/services/is-england')]
  agol.esriRequest = agol.esriRequest = async () => ([{}])
}

const stopMockingEsriRequests = () => {
  agol.esriRequest = restoreEsriRequest
}

module.exports = { mockEsriRequest, stopMockingEsriRequests }
