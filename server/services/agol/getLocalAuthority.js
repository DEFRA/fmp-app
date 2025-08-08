const { config } = require('../../../config')
const { esriFeatureRequestByIntersectArea } = require('./')

const getLocalAuthority = (options) => {
  return esriFeatureRequestByIntersectArea(config.agol.localAuthorityEndPoint, options.geometry, options.geometryType, 'getLocalAuthority')
    .then((esriResult) => {
      if (!esriResult || !Array.isArray(esriResult)) {
        throw new Error('Invalid response from AGOL localAuthority request')
      }
      const { attributes } = esriResult[0]
      return { LocalAuthorities: attributes.ons_name }
    })
}

module.exports = { getLocalAuthority }
