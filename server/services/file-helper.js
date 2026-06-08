const Busboy = require('busboy')

const getFile = (request) => {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: request.raw.req.headers })

    busboy.on('file', (fieldname, file, filename) => {
      console.log(`file uploaded: ${filename}`)
      resolve(file)
    })

    busboy.on('error', (err) => {
      reject(err)
    })

    busboy.on('close', () => {
      reject(new Error('Non file received'))
    })

    request.raw.req.pipe(busboy)
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
