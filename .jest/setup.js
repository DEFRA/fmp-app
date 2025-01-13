const createServer = require('../server')
const ORIGINAL_ENV = process.env

let server

beforeEach(async () => {
  jest.resetAllMocks()
  // add any common mockage here, eg json POSTs
  server = await createServer()
  await server.initialize()
})

afterEach(async () => {
  try {
    if (server) {
      await server.stop()
    }
  } finally {
    // reset environment variables after test
    process.env = { ...ORIGINAL_ENV }
  }
})

const getServer = () => server

export { getServer }