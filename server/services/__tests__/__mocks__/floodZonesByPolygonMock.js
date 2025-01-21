const mockPolygons = require('../../__data__/mockPolygons.json')

jest.mock('../../agol/getFloodZones')
jest.mock('../../riskAdmin/isRiskAdminArea')
jest.mock('../../agol/getRiversAndSeaDefended')
jest.mock('../../agol/getRiversAndSeaUndefended')
jest.mock('../../agol/getRiversAndSeaDefendedClimateChange')
jest.mock('../../agol/getRiversAndSeaUndefendedClimateChange')
jest.mock('../../agol/getSurfaceWater')

module.exports = { mockPolygons }
