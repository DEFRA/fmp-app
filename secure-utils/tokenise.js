const { createSign, createVerify } = require('node:crypto')

// Keys are stored base64 encoded (see generateKeys.js), so decode them back to PEM
const fromBase64 = (key) => Buffer.from(key, 'base64').toString('utf8')

const signToken = (data, privateKey64Bit) => {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url')
  const signature = createSign('SHA256').update(payload).sign({ key: fromBase64(privateKey64Bit), dsaEncoding: 'ieee-p1363' }, 'base64url')
  return `${payload}.${signature}`
}

const extractTokenValue = (token, publicKey64Bit) => {
  try {
    const [payload, signature] = token.split('.')
    const isValid = createVerify('SHA256').update(payload).verify({ key: fromBase64(publicKey64Bit), dsaEncoding: 'ieee-p1363' }, signature, 'base64url')
    return isValid ? JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) : null
  } catch (error) {
    // If any error occurs (e.g., invalid token format, failed verification), return null
    // no need to throw here, as the consuming code will treat a null response as an invalid
    // or missing token.
    console.error('Failed to extract a token value:', token, error)
    return null
  }
}

module.exports = { signToken, extractTokenValue }
