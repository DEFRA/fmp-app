const { generateKeys } = require('./generateKeys')

const fromBase64 = (value) => Buffer.from(value, 'base64').toString('utf8')

describe('generateKeys', () => {
  it('should generate a public and private key', () => {
    const keys = generateKeys()
    expect(keys.publicKey).toBeDefined()
    expect(keys.privateKey).toBeDefined()
  })

  it('should generate new keys on each call', () => {
    const key1 = generateKeys()
    const key2 = generateKeys()
    expect(key1.publicKey).not.toEqual(key2.publicKey)
    expect(key1.privateKey).not.toEqual(key2.privateKey)
  })

  it('should generate keys in base64 format', () => {
    const keys = generateKeys()
    expect(keys.publicKey).toMatch(/^[A-Za-z0-9+/]+={0,2}$/)
    expect(keys.privateKey).toMatch(/^[A-Za-z0-9+/]+={0,2}$/)
  })

  it('should decode to PEM encoded keys', () => {
    const keys = generateKeys()
    expect(fromBase64(keys.publicKey)).toMatch(/^-----BEGIN PUBLIC KEY-----\n[\s\S]+\n-----END PUBLIC KEY-----\n$/)
    expect(fromBase64(keys.privateKey)).toMatch(/^-----BEGIN PRIVATE KEY-----\n[\s\S]+\n-----END PRIVATE KEY-----\n$/)
  })
})
