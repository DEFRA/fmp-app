jest.mock('../config/environment')
const createServer = require('../server')
const ORIGINAL_ENV = process.env
const CONSOLE_ERROR = console.error
const CONSOLE_LOG = console.log
const DEV_NULL_LOG = () => {}
let server

beforeEach(async () => {
  jest.resetAllMocks()
  // add any common mockage here, eg json POSTs
  server = await createServer()
  await server.initialize()
  if (process.env.NOLOG) {
    console.log = DEV_NULL_LOG
    console.error = DEV_NULL_LOG
  }
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
  console.log = CONSOLE_LOG
  console.error = CONSOLE_ERROR
})

const getServer = () => server

export { getServer }