jest.mock('../config/environment')
const CONSOLE_ERROR = console.error
const CONSOLE_LOG = console.log
const DEV_NULL_LOG = () => {}

beforeEach(async () => {
  jest.resetAllMocks()
  if (process.env.NOLOG) {
    console.log = DEV_NULL_LOG
    console.error = DEV_NULL_LOG
  }
})

afterEach(async () => {
  console.log = CONSOLE_LOG
  console.error = CONSOLE_ERROR
})
