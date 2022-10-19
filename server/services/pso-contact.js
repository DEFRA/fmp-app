const util = require('../util')
const config = require('../../config')
const url = config.service + '/get-pso-contacts/'

const getPsoContacts = (easting, northing) => {
  try {
    if (!easting || !northing) {
      throw new Error('No point provided')
    }
    // EmailAddress: 'neyorkshire@environment-agency.gov.uk',
    // AreaName: 'Environment Agency team in Yorkshire',
    // LocalAuthorities: [ [ 'Ryedale' ] ],
    // useAutomatedService: true?

    return util.getJson(url + easting + '/' + northing)
      .then((result) => {
        const { emailaddress: EmailAddress, areaname: AreaName, localauthorities: LocalAuthorities, useautomatedservice: useAutomatedService } = result
        return {
          EmailAddress,
          AreaName,
          LocalAuthorities: [[LocalAuthorities]],
          useAutomatedService
        }
      })
  } catch (error) {
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
      cache: 'FMFP', expiresIn, staleIn, generateTimeout, staleTimeout
    }
  }
}
