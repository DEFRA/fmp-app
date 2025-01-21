const { makePointGeometry, makePolygonGeometry } = require('./')
const { getCustomerTeam } = require('./getCustomerTeam')
const { getLocalAuthority } = require('./getLocalAuthority')

const getContacts = async (options = {}) => {
  options.geometry = options.geometryType === 'esriGeometryPolygon'
    ? makePolygonGeometry(options.polygon)
    : makePointGeometry(options.x, options.y)

  // const response = {
  //   isEngland: false,
  //   EmailAddress: '',
  //   AreaName: '',
  //   LocalAuthorities: '',
  //   useAutomatedService: false
  // }
  // try {
  return await Promise.all([
    getCustomerTeam(options),
    getLocalAuthority(options)
  ]).then((responseArray) => {
    return Object.assign({}, ...responseArray)
  })
  // } catch (error) {
  //   throw(error)
  //   console.log('caught getContacts ERROR', error)
  //   throw new Error('Fetching getContacts failed: ', error)
  // }
}

module.exports = { getContacts }
