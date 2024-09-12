const util = require('../util')
const config = require('../../config')
const url = config.service + '/pso-contacts-by-polygon?polygon='

const getPsoContactsByPolygon = (polygon) => {
  try {
    const geoJsonPolygon = util.convertToGeoJson(polygon)
    const myurl = url + geoJsonPolygon
    return util.getJson(myurl).then((result) => {
      const {
        emailaddress: EmailAddress,
        areaname: AreaName,
        localauthority: LocalAuthorities,
        useautomatedservice: useAutomatedService
      } = result
      return {
        EmailAddress,
        AreaName,
        LocalAuthorities,
        useAutomatedService
      }
    })
  } catch (error) {
    throw new Error('Fetching Pso contacts by polygon failed: ', error)
  }
}

const expiresIn = 600000 // 10 minutes
const staleIn = 540000 // 9 minutes
const generateTimeout = 10000 // 10 seconds
const staleTimeout = 59000 // 59 seconds

module.exports = {
  name: 'getPsoContactsByPolygon',
  method: getPsoContactsByPolygon,
  options: {
    cache: {
      cache: 'FMFP',
      expiresIn,
      staleIn,
      generateTimeout,
      staleTimeout
    },
    generateKey: (polygon) => JSON.stringify(polygon)
  }
}
