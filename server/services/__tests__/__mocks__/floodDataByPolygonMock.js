const mockPolygons = require('../../__data__/mockPolygons.json')

jest.mock('../../agol/getFloodZones')
jest.mock('../../agol/getFloodZonesClimateChange')
jest.mock('../../riskAdmin/isRiskAdminArea')
jest.mock('../../agol/getSurfaceWater')
jest.mock('../../agol/getSurfaceWaterClimateChange')

module.exports = { mockPolygons }
