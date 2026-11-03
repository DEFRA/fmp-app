const { generateKeyPairSync } = require('node:crypto')

const generateKeys = () => {
  const { publicKey, privateKey } = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  })
  return {
    publicKey: Buffer.from(publicKey).toString('base64'),
    privateKey: Buffer.from(privateKey).toString('base64'),
  }
}

// Run this file directly to generate and print new keys in base64 format
// ie node secure-utils/generateKeys.js
// This will print the generated keys in base64 format to the console
// they should be added as secrets.
// fmp-app should have the generated proxyPrivateKey added as a secret.
// fmp-proxy should have the generated proxyPublicKey added as an environment value.
/* istanbul ignore if */
if (require.main === module) {
  const { publicKey, privateKey } = generateKeys()
  console.log({ publicKey, privateKey })
}
module.exports = { generateKeys }
