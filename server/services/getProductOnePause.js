const { formatUKTimeAndPauseText } = require('./dates')
const axios = require('axios')

const getProductOnePause = async (pauseP1URL) => {
  let payload
  let dateWithinPausePeriod = false

  try {
    const response = await axios.get(pauseP1URL, { json: true })
    payload = response.data
    if (payload.pauseP1DownloadFrom !== null) {
      dateWithinPausePeriod = (payload.pauseP1DownloadTo === null && Date.now() >= payload.pauseP1DownloadFrom) || (Date.now() >= payload.pauseP1DownloadFrom && Date.now() <= payload.pauseP1DownloadTo)
    }
  } catch (error) {
    payload = { pauseP1DownloadFrom: null, pauseP1DownloadTo: null } // default values if error occurs
    console.log('Error getting p1 pause', error)
  }
  const pauseP1DownloadTo = payload?.pauseP1DownloadTo !== null && payload.pauseP1DownloadFrom !== null ? formatUKTimeAndPauseText(payload.pauseP1DownloadTo) : null
  return {
    pauseP1DownloadTo,
    dateWithinPausePeriod
  }
}

module.exports = {
  getProductOnePause
}
