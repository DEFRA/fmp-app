const axios = require('axios')

const getProductOnePause = async (pauseP1URL) => {
  let payload
  try {
    const response = await axios.get(pauseP1URL, { json: true })
    payload = response.data
  } catch (error) {
    payload = { pauseP1DownloadFrom: null, pauseP1DownloadTo: null } // default values if error occurs
    console.log('Error getting p1 pause', error)
  }
  return payload
}

module.exports = {
  getProductOnePause
}
