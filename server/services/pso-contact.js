const util = require('../util')
const config = require('../../config')
const url = config.service + '/pso-region-contact-details/'

module.exports = {
  get: (easting, northing) => {
    if (!easting || !northing) {
      throw new Error('No point provided')
    }
    return util.getJson(url + easting + '/' + northing)
  }
}