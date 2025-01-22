const { makePointGeometry, makePolygonGeometry } = require('./')
const { getCustomerTeam } = require('./getCustomerTeam')
const { getLocalAuthority } = require('./getLocalAuthority')

const getContacts = async (options) => {
  options.geometry = options.geometryType === 'esriGeometryPolygon'
    ? makePolygonGeometry(options.polygon)
    : makePointGeometry(options.x, options.y)
  return await Promise.all([
    getCustomerTeam(options),
    getLocalAuthority(options)
  ]).then((responseArray) => {
    return Object.assign({}, ...responseArray)
  })
}

module.exports = { getContacts }
