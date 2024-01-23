const util = require('../util')
const config = require('../../config')
const url = config.service + '/snd-password'
const { encryptData, decryptData } = require('./encryption')

module.exports = {
  validate: async (password) => {
    const { snd_password: requiredPassword } = await util.getJson(url)
    return (requiredPassword === password)
  },
  encrypt: async password => encryptData(password),
  decrypt: async password => decryptData(password)
}
