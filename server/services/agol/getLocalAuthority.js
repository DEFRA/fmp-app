const { config } = require('../../../config')
const { esriRequestByIntersectArea } = require('./')

const getLocalAuthority = (options) => {
  return esriRequestByIntersectArea(config.agol.localAuthorityEndPoint, options.geometry, options.geometryType)
    .then((esriResult) => {
      if (!esriResult || !Array.isArray(esriResult)) {
        throw new Error('Invalid response from AGOL localAuthority request')
      }
      const { attributes } = esriResult[0]
      return { LocalAuthorities: attributes.ons_name }
    })
}

module.exports = { getLocalAuthority }
