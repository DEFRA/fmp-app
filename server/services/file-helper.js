const multiparty = require('multiparty')

const getFile = (request) => {
  const form = new multiparty.Form()
  return new Promise((resolve, reject) => {
    form.on('part', (part) => {
      if (part.filename) {
        console.log(`file uploaded: ${part.filename}`)
        resolve(part)
      } else {
        reject(new Error('Non file received'))
      }
    })
    form.on('error', (err) => {
      reject(err)
    })
    form.parse(request.raw.req)
  })
}

const streamToBuffer = async (stream) => {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

module.exports = { getFile, streamToBuffer }
