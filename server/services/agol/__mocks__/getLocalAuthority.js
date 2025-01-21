const mockPolygons = require('../../__data__/mockPolygons.json')

const bathResponse = { LocalAuthorities: 'Bath and North East Somerset' }
const yorkshireResponse = { LocalAuthorities: 'North Yorkshire' }
const wessexResponse = { LocalAuthorities: 'Winchester' }

const getLocalAuthority = async (options = {}) => {
  if (options.geometryType === 'esriGeometryPoint') {
    return wessexResponse
  }
  switch (options.polygon) {
    case mockPolygons.optedOut.fz3_only:
      return bathResponse
    case mockPolygons.fz1_only:
    case mockPolygons.inRiskAdmin.fz1_only:
    case mockPolygons.inRiskAdmin.throws:
    case mockPolygons.fz2_only:
    case mockPolygons.inRiskAdmin.fz2_only:
    case mockPolygons.fz3_only:
    case mockPolygons.inRiskAdmin.fz3_only:
    case mockPolygons.fz2_and_3:
    case mockPolygons.inRiskAdmin.fz2_and_3:
      return yorkshireResponse
    default: {
      throw new Error(`Error - No Polygon Mocked for getLocalAuthority- ${JSON.stringify(options.polygon)}`)
    }
  }
}

module.exports = { getLocalAuthority }
