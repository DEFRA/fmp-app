const { config } = require('../../config')
const { esriRequest, makePointGeometry } = require('./agol')

const getPsoContacts = async (easting, northing) => {
  try {
    if (!easting || !northing) {
      throw new Error('No point provided')
    }

    const _response = {}

    const response = await Promise.all([
      esriRequest(config.agol.customerTeamEndPoint, makePointGeometry(easting, northing), 'esriGeometryPoint')
        .then((esriResult) => {
          if (!esriResult || !Array.isArray(esriResult) || esriResult.length === 0 || !esriResult[0].attributes) {
            throw new Error('Invalid response from AGOL customerTeam request')
          }
          const { attributes } = esriResult[0]
          Object.assign(_response, {
            EmailAddress: attributes.contact_email,
            AreaName: attributes.area_name,
            useAutomatedService: Boolean(attributes.use_automated_service)
          })
        }),
      esriRequest(config.agol.localAuthorityEndPoint, makePointGeometry(easting, northing), 'esriGeometryPoint')
        .then((esriResult) => {
          if (!esriResult || !Array.isArray(esriResult) || esriResult.length === 0 || !esriResult[0].attributes) {
            throw new Error('Invalid response from AGOL localAuthority request')
          }
          const { attributes } = esriResult[0]
          Object.assign(_response, { LocalAuthorities: attributes.authority_name })
        })
    ]).then(() => {
      return _response
    })
    return response
  } catch (error) {
    console.log('pso-contact', error.message, '\n', error)
    throw new Error('Fetching Pso contacts failed: ', error)
  }
}

const expiresIn = 600000 // 10 minutes
const staleIn = 540000 // 9 minutes
const generateTimeout = 10000 // 10 seconds
const staleTimeout = 59000 // 59 seconds

module.exports = {
  name: 'getPsoContacts',
  method: getPsoContacts,
  options: {
    cache: {
      cache: 'FMFP',
      expiresIn,
      staleIn,
      generateTimeout,
      staleTimeout
    }
  }
}
