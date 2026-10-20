describe('allowedOrigins', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    delete process.env.localhostOrigin
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  const load = (env) => {
    process.env.ENV = env
    return require('../allowedOrigins').allowedOrigins
  }

  it('throws if ENV is not set', () => {
    delete process.env.ENV
    expect(() => require('../allowedOrigins')).toThrow('ENV environment variable is not set')
  })

  it.each([
    ['development', ['fmp2-internal-dev.aws-int.defra.cloud', 'fmp2-dev.aws-int.defra.cloud']],
    ['test', ['fmp2-internal-tst.aws-int.defra.cloud', 'fmp2-tst.aws-int.defra.cloud']],
    ['pre-prod', ['fmp2-internal-pre.aws-int.defra.cloud', 'fmp2-pre.aws-int.defra.cloud']],
    ['prod', [
      'flood-map-for-planning.service.gov.uk',
      'fmp2-prd-blue.aws.defra.cloud',
      'fmp2-prd-green.aws.defra.cloud',
      'fmp-internal.prd.defra.cloud',
      'fmp2-internal-prd-blue.aws-int.defra.cloud',
      'fmp2-internal-prd-green.aws-int.defra.cloud'
    ]]
  ])('returns the hosts for the %s environment, each mapped to itself', (env, hosts) => {
    const allowedOrigins = load(env)
    expect(Object.keys(allowedOrigins).sort()).toEqual([...hosts].sort())
    hosts.forEach(host => expect(allowedOrigins[host]).toBe(host))
  })

  it('returns no origins for an unknown environment', () => {
    expect(load('local')).toEqual({})
  })

  it('adds a valid localhostOrigin', () => {
    process.env.localhostOrigin = 'localhost:3000'
    expect(load('local')).toEqual({ 'localhost:3000': 'localhost:3000' })
  })

  it('adds localhostOrigin alongside the environment hosts', () => {
    process.env.localhostOrigin = 'localhost:8050'
    const allowedOrigins = load('test')
    expect(allowedOrigins['localhost:8050']).toBe('localhost:8050')
    expect(allowedOrigins['fmp2-tst.aws-int.defra.cloud']).toBe('fmp2-tst.aws-int.defra.cloud')
  })

  it.each([
    'localhost',
    'localhost:',
    'localhost:abc',
    'http://localhost:3000',
    'evil.com:3000',
    'localhost:3000/path',
    ' localhost:3000'
  ])('throws for invalid localhostOrigin "%s"', (value) => {
    process.env.localhostOrigin = value
    expect(() => load('local')).toThrow("Invalid localhostOrigin format. Expected 'localhost:<port>'")
  })
})
