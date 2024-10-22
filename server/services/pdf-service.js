const util = require('../util')
const { config } = require('../../config')
const url = config.service + '/printservice/'

module.exports = {
  get: (easting, northing) => {
    if (!easting || !northing) {
      throw new Error('No point provided')
    }
    return util.getJson(url + easting + '/' + northing)
  }
}
