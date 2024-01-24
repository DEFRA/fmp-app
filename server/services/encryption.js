// encryption.js
const crypto = require('crypto')
const config = require('../../config')

const { key, iv, method } = (config.sndPasswordEncryption || {})

if (!key || !iv || !method) {
  throw new Error('secretKey, secretIV, and ecnryptionMethod are required')
}

// Generate secret hash with crypto to use for encryption
const encyptionKey = crypto
  .createHash('sha512')
  .update(key)
  .digest('hex')
  .substring(0, 32)

const encryptionIV = crypto
  .createHash('sha512')
  .update(iv)
  .digest('hex')
  .substring(0, 16)

// Encrypt data
const encryptData = data => {
  const cipher = crypto.createCipheriv(method, encyptionKey, encryptionIV)
  return Buffer.from(
    cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
  ).toString('base64') // Encrypts data and converts to hex and base64
}

// Decrypt data
const decryptData = (encryptedData) => {
  try {
    const buff = Buffer.from(encryptedData, 'base64')
    const decipher = crypto.createDecipheriv(method, encyptionKey, encryptionIV)
    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      decipher.final('utf8')
    ) // Decrypts data and converts to utf8
  } catch (error) {
    console.log('decryptData error: ', error)
    return ''
  }
}

module.exports = { encryptData, decryptData }
