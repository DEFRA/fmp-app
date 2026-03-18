const fs = require('fs')
const path = require('path')

const envPath = path.resolve(__dirname, '..', '.env')
const examplePath = path.resolve(__dirname, '.env-example')

require('dotenv').config({
  path: fs.existsSync(envPath) ? envPath : examplePath
})
