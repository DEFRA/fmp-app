const mockCookies = jest.fn()
jest.mock('./modules/cookies', () => ({
  __esModule: true,
  default: (...args) => mockCookies(...args)
}))

describe('core', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should invoke the cookies module on import', () => {
    require('./core.js')

    expect(mockCookies).toHaveBeenCalledTimes(1)
  })
})
