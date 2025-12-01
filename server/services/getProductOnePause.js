const { formatUKTimeAndPauseText } = require('./dates')
const axios = require('axios')

const getProductOnePause = async (pauseP1URL) => {
  try {
    const response = await axios.get(pauseP1URL, { json: true })
    const { pauseP1DownloadTo, pauseP1DownloadFrom } = response.data
    const dateWithinPausePeriod = pauseP1DownloadFrom
      ? (!pauseP1DownloadTo && Date.now() >= pauseP1DownloadFrom) || (Date.now() >= pauseP1DownloadFrom && Date.now() <= pauseP1DownloadTo)
      : false
    return {
      pauseP1DownloadTo: pauseP1DownloadTo && pauseP1DownloadFrom ? formatUKTimeAndPauseText(pauseP1DownloadTo) : null,
      dateWithinPausePeriod
    }
  } catch (error) {
    console.log('Error getting p1 pause', error)
    return {
      dateWithinPausePeriod: false
    }
  }
}

module.exports = {
  getProductOnePause
}
