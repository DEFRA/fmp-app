require('./server/config/environment')
const createServer = require('./server/createServer')

createServer()
  .then((server) => server.start())
  .catch((err) => {
    console.log('error', err)
    process.exit(1)
  })
