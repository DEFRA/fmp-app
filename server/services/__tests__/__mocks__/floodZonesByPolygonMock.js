const mockPolygons = require('../../__data__/mockPolygons.json')

jest.mock('../../agol/getFloodZones')
jest.mock('../../riskAdmin/isRiskAdminArea')

module.exports = { mockPolygons }
