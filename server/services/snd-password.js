const util = require('../util')
const config = require('../../config')
const url = config.service + '/snd-password'

module.exports = {
  validate: async (password) => {
    const { snd_password: requiredPassword } = await util.getJson(url)
    return (requiredPassword === password)
  }
}
