const { config } = require('../../../config')
const { esriRequest, makePointGeometry, makePolygonGeometry } = require('./')

const getContacts = async (options = {}) => {
  const geometry = options.geometryType === 'esriGeometryPolygon'
    ? makePolygonGeometry(options.polygon)
    : makePointGeometry(options.x, options.y)

  const response = {
    isEngland: false,
    EmailAddress: '',
    AreaName: '',
    LocalAuthorities: '',
    useAutomatedService: false
  }
  return await Promise.all([
    esriRequest(config.agol.customerTeamEndPoint, geometry, options.geometryType)
      .then((esriResult) => {
        // Note This request WILL NOT return data for areas that are outside of England
        if (!esriResult || !Array.isArray(esriResult)) {
          throw new Error('Invalid response from AGOL customerTeam request')
        }
        response.isEngland = esriResult.length > 0
        const { attributes } = esriResult[0]
        // console.log('\ncustomerTeam Results ', esriResult)
        Object.assign(response, {
          EmailAddress: attributes.contact_email,
          AreaName: attributes.area_name_1, // This will change back to area_name once Paul fixes the data.
          useAutomatedService: Boolean(attributes.use_automated_service)
        })
      }),
    esriRequest(config.agol.localAuthorityEndPoint, geometry, options.geometryType)
      .then((esriResult) => {
        // Note This request WILL return data for areas that are outside of England (Paul is going to fix that)
        if (!esriResult || !Array.isArray(esriResult)) {
          throw new Error('Invalid response from AGOL localAuthority request')
        }
        const { attributes } = esriResult[0]
        // console.log('\nlocalAuthority Results ', esriResult)
        Object.assign(response, { LocalAuthorities: attributes.authority_name })
      })
  ]).then(() => response)
}

module.exports = { getContacts }
