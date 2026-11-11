const { generateKeys } = require('./generateKeys')
const { signToken, extractTokenValue } = require('@defra/fmp-utilities/secureUtils')

describe('Tokenise Utils', () => {
  const { publicKey, privateKey } = generateKeys()
  const { publicKey: otherPublicKey, privateKey: otherPrivateKey } = generateKeys()

  it('should sign and extract token correctly', () => {
    const data = { foo: 'bar' }
    const token = signToken(data, privateKey)
    const extracted = extractTokenValue(token, publicKey)
    expect(extracted).toEqual(data)
  })

  it('should return null for an invalid token', () => {
    const invalidToken = 'Unsigned token'
    const extracted = extractTokenValue(invalidToken, publicKey)
    expect(extracted).toBeNull()
  })

  it('should return null for a token signed with a different key', () => {
    const data = { foo: 'bar' }
    const token = signToken(data, otherPrivateKey)
    console.log(token)
    const extracted = extractTokenValue(token, publicKey)
    expect(extracted).toBeNull()
  })

  it('should return null for a token extracted with a different public key', () => {
    const data = { foo: 'bar' }
    const token = signToken(data, privateKey)
    const extracted = extractTokenValue(token, otherPublicKey)
    expect(extracted).toBeNull()
  })
})
