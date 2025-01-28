const mockPolygons = require('../../__data__/mockPolygons.json')

const optedOutResponse = {
  isEngland: true,
  EmailAddress: 'wessexenquiries@environment-agency.gov.uk',
  AreaName: 'Wessex',
  useAutomatedService: false
}

const optedInResponse = {
  isEngland: true,
  EmailAddress: 'neyorkshire@environment-agency.gov.uk',
  AreaName: 'Yorkshire',
  useAutomatedService: true
}

const getCustomerTeam = async (options = {}) => {
  if (options.geometryType === 'esriGeometryPoint') {
    return optedOutResponse
  }
  switch (options.polygon) {
    case mockPolygons.optedOut.fz3_only:
      return optedOutResponse
    case mockPolygons.fz1_only:
    case mockPolygons.inRiskAdmin.fz1_only:
    case mockPolygons.inRiskAdmin.throws:
    case mockPolygons.fz2_only:
    case mockPolygons.inRiskAdmin.fz2_only:
    case mockPolygons.fz3_only:
    case mockPolygons.inRiskAdmin.fz3_only:
    case mockPolygons.fz2_and_3:
    case mockPolygons.inRiskAdmin.fz2_and_3:
      return optedInResponse
    default: {
      throw new Error(`Error - No Polygon Mocked for getCustomerTeam- ${JSON.stringify(options.polygon)}`)
    }
  }
}

module.exports = { getCustomerTeam }
