const zeroPad = num => String(num).padStart(2, '0')
const londonTimeZone = 'Europe/London'

/* This files was copied from fmp-api, these utilities will be moved into their own package later
*
* offsetDateIfUTC: Offset the hour by 1 if the server is in UTC time and the time is in BST.
* This is covered, but shows as uncovered as some lines are run locally and some are run on github
* istanbul ignore next stops it counting as uncovered lines.
*/
/* istanbul ignore next */
const offsetDateIfUTC = (date) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const timestamp = new Date(date).getTime()
  if (timeZone === londonTimeZone) {
    // This is here so tests pass locally and on github
    // and the code works consistently on both
    return timestamp
  }
  const offset = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'long', timeZone: londonTimeZone }).format(new Date(date)).match('BST') ? MILLISECONDS.HOUR : 0
  return timestamp - offset
}

const formatUKDate = (date) => {
  try {
    if (!date) {
      return ''
    }
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeZone: londonTimeZone }).format(date)
  } catch {
    return ''
  }
}

const formatUKTimeToMinute = (date) => {
  try {
    if (!date) {
      return ''
    }
    return new Intl.DateTimeFormat('en-GB', { timeStyle: 'short', timeZone: londonTimeZone }).format(date)
  } catch {
    return ''
  }
}

const formatUKDateTime = date => {
  try {
    if (!date) {
      return ''
    }
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium', timeZone: londonTimeZone }).format(date)
  } catch {
    return ''
  }
}

const formatUKDateTimeWithTimeZone = date => {
  try {
    if (!date) {
      return ''
    }
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'long', timeZone: londonTimeZone }).format(date)
  } catch {
    return ''
  }
}

const formatUKDateTimeToMinute = (date) => {
  try {
    if (!date) {
      return ''
    }
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: londonTimeZone }).format(date).replace(',', '')
  } catch {
    return ''
  }
}

const markUpUkDate = (date, elapsedTime, className = '') => {
  try {
    if (!date) {
      return ''
    }
    const [datePart, timeWithZonePart] = formatUKDateTimeWithTimeZone(date).split(', ')
    const [timePart, zonePart] = timeWithZonePart.split(' ')
    const elapsed = elapsedTime ? `<div class="elapsed">[${elapsedTime}]</div>` : ''
    return `<div class="uk-date ${className}">
    <div class="date">${datePart}</div>
    <div class="uk-time">
      <div class="time">${timePart}</div>
      <div class="zone">${zonePart}</div>
      ${elapsed}
    </div>
  </div>`
  } catch {
    return ''
  }
}
const MILLISECONDS = {
  SECOND: 1000,
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000
}

const calculateElapsedTime = (startTime, timeStamp) => {
  if (!(timeStamp && startTime && !isNaN(timeStamp) && !isNaN(startTime))) {
    return ''
  }
  const logTime = new Date(timeStamp)
  const milliSeconds = logTime - startTime
  const seconds = Math.trunc(milliSeconds / MILLISECONDS.SECOND)
  const minutes = Math.trunc(milliSeconds / MILLISECONDS.MINUTE) % 60
  const hours = Math.trunc(milliSeconds / MILLISECONDS.HOUR) % 24
  const days = Math.trunc(milliSeconds / MILLISECONDS.DAY)
  return `${days ? `${days}:` : ''}${hours ? `${hours}:` : ''}${zeroPad(minutes % 60)}:${zeroPad(seconds % 60)}`
}

// Returns a long date formatted eg. '1:01am on Sunday 1 January 2023'
// See: https://www.gov.uk/guidance/style-guide/a-to-z#times
// and the .spec file for more examples
const formatUKTimeAndPauseText = (timestamp) => {
  if (!timestamp) {
    return ''
  }
  try {
    const datePart = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      timeZone: londonTimeZone
    }).format(timestamp)

    const timePart = new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h12',
      timeZone: londonTimeZone
    }).format(timestamp)

    return `${timePart} on ${datePart}`
      .replace(',', '')
      .replace(' pm', 'pm')
      .replace(' am', 'am')
      .replace(':00', '')
      .replace('12am', 'midnight')
      .replace('12pm', 'midday')
  } catch {
    return ''
  }
}

module.exports = {
  formatUKDate,
  formatUKTimeToMinute,
  formatUKTimeAndPauseText,
  formatUKDateTime,
  formatUKDateTimeWithTimeZone,
  markUpUkDate,
  calculateElapsedTime,
  formatUKDateTimeToMinute,
  MILLISECONDS,
  offsetDateIfUTC
}
