const { config } = require('../../../config')
const { esriRequest, makePointGeometry, makePolygonGeometry } = require('./')

const getContacts = async (options = {}) => {
  const geometry = options.geometryType === 'esriGeometryPolygon'
    ? makePolygonGeometry(options.polygon)
    : makePointGeometry(options.x, options.y)

  const response = {}
  return await Promise.all([
    esriRequest(config.agol.customerTeamEndPoint, geometry, options.geometryType)
      .then((esriResult) => {
        if (!esriResult || !Array.isArray(esriResult) || esriResult.length === 0 || !esriResult[0].attributes) {
          throw new Error('Invalid response from AGOL customerTeam request')
        }
        const { attributes } = esriResult[0]
        Object.assign(response, {
          EmailAddress: attributes.contact_email,
          AreaName: attributes.area_name,
          useAutomatedService: Boolean(attributes.use_automated_service)
        })
      }),
    esriRequest(config.agol.localAuthorityEndPoint, geometry, options.geometryType)
      .then((esriResult) => {
        if (!esriResult || !Array.isArray(esriResult) || esriResult.length === 0 || !esriResult[0].attributes) {
          throw new Error('Invalid response from AGOL localAuthority request')
        }
        const { attributes } = esriResult[0]
        Object.assign(response, { LocalAuthorities: attributes.authority_name })
      })
  ]).then(() => response)
}

module.exports = { getContacts }
