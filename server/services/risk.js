const util = require('../util')
const config = require('../../config')
const url = config.service + '/zones/'

module.exports = {
  get: (easting, northing) => {
    if (!easting || !northing) {
      throw new Error('No Point provided')
    }
    return util.getJson(url + easting + '/' + northing + '/1')
  }
}
