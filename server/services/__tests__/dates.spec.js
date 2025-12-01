const {
  formatUKTimeToMinute,
  formatUKDate,
  formatUKDateTimeToMinute,
  formatUKTimeAndPauseText,
  formatUKDateTime,
  formatUKDateTimeWithTimeZone,
  calculateElapsedTime,
  markUpUkDate,
  MILLISECONDS,
  getPausePeriodStatus
} = require('../../../server/services/dates')

const epochStartTime = 1685791103000
const epochOneSecondLater = epochStartTime + MILLISECONDS.SECOND
const epochOneMinuteAndSecondLater = epochOneSecondLater + MILLISECONDS.MINUTE
const epochOneHourMinuteAndSecondLater = epochOneMinuteAndSecondLater + MILLISECONDS.HOUR
const epochOneDayHourMinuteAndSecondLater = epochOneHourMinuteAndSecondLater + MILLISECONDS.DAY
const epochCloseToMidnight = epochStartTime + MILLISECONDS.HOUR * 12 // 04/06/2023 00:18:23 BST

const april12 = 1681337582000
const january01 = 1672534861001
const december12 = 1701694799000

const tests = [
  // epoch, formatUKTimeToMinute, formatUKDate, formatUKDateTime, formatUKDateTimeWithTimeZone, formatUKDateTimeToMinute
  [january01,
    '01:01',
    '01/01/2023',
    '01/01/2023 01:01',
    '01/01/2023, 01:01:01',
    '01/01/2023, 01:01:01 GMT'
  ],
  [april12,
    '23:13',
    '12/04/2023',
    '12/04/2023 23:13',
    '12/04/2023, 23:13:02',
    '12/04/2023, 23:13:02 BST'
  ],
  [december12,
    '12:59',
    '04/12/2023',
    '04/12/2023 12:59',
    '04/12/2023, 12:59:59',
    '04/12/2023, 12:59:59 GMT'
  ],
  [epochStartTime,
    '12:18',
    '03/06/2023',
    '03/06/2023 12:18',
    '03/06/2023, 12:18:23',
    '03/06/2023, 12:18:23 BST'
  ],
  [epochCloseToMidnight,
    '00:18',
    '04/06/2023',
    '04/06/2023 00:18',
    '04/06/2023, 00:18:23',
    '04/06/2023, 00:18:23 BST'
  ],
  [undefined,
    '',
    '',
    '',
    '',
    ''
  ],
  ['INVALID DATE',
    '',
    '',
    '',
    '',
    ''
  ]
]

describe('dates', () => {
  describe.each([
    ['formatUKTimeToMinute', formatUKTimeToMinute, 1],
    ['formatUKDate', formatUKDate, 2],
    ['formatUKDateTimeToMinute', formatUKDateTimeToMinute, 3],
    ['formatUKDateTime', formatUKDateTime, 4],
    ['formatUKDateTimeWithTimeZone', formatUKDateTimeWithTimeZone, 5]
  ])('%s', (functionName, dateFunction, expectedResultIndex) => {
    tests.forEach((test) => {
      const [date] = test
      const expectedDisplayDate = test[expectedResultIndex]
      it(`should format ${date} as "${expectedDisplayDate}"`, () => {
        expect(dateFunction(date)).toEqual(expectedDisplayDate)
      })
    })
  })

  const formatDate = (theDate) => {
    try {
      const [date, time] = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Europe/London' }).format(theDate).split(', ')
      const [day, month, year] = date.split('/')
      return `${year}-${month}-${day} ${time}`
    } catch {
      return theDate
    }
  }
  describe('calculateElapsedTime and markUpUkDate', () => {
    const tests = [
      [epochStartTime, epochOneSecondLater, '00:01'],
      [epochStartTime, epochOneMinuteAndSecondLater, '01:01'],
      [epochStartTime, epochOneHourMinuteAndSecondLater, '1:01:01'],
      [epochStartTime, epochOneDayHourMinuteAndSecondLater, '1:1:01:01'],
      [epochStartTime, epochOneDayHourMinuteAndSecondLater + 20 * MILLISECONDS.HOUR, '1:21:01:01'],
      [undefined, epochOneDayHourMinuteAndSecondLater, ''],
      [epochStartTime, undefined, ''],
      ['INVALID', epochStartTime, ''],
      [epochStartTime, 'INVALID', '']
    ]
    tests.forEach(([epochStart, epochNow, expectedElapsedTime]) => {
      const formattedStart = epochStart ? formatDate(epochStart) : epochStart
      const formattedEnd = epochNow ? formatDate(epochNow) : epochNow

      it(`calculateElapsedTime should show time between "${formattedStart}" & "${formattedEnd}" as "${expectedElapsedTime}"`, () => {
        expect(calculateElapsedTime(epochStart, epochNow)).toEqual(expectedElapsedTime)
      })

      it(`markUpUkDate should generate expected markup for "${formattedEnd}" with ${expectedElapsedTime} elapsed time"`, () => {
        expect(markUpUkDate(epochNow, expectedElapsedTime)).toMatchSnapshot()
      })
    })
  })

  describe('formatUKTimeAndPauseText', () => {
    it('should format date correctly', () => {
      expect(formatUKTimeAndPauseText(1764265080000)).toEqual('5.38pm on Thursday 27 November 2025')
    })

    it('should return empty string for invalid date', () => {
      expect(formatUKTimeAndPauseText(null)).toEqual('')
    })
  })

  describe('getPausePeriodStatus', () => {
    beforeEach(() => {
      Date.now = jest.fn(() => 1764258880000)
    })
    it('should return true when the current date falls within the pause period', () => {
      const pauseFrom = new Date(1764257880000)
      const pauseTo = new Date(1764265080000)
      expect(getPausePeriodStatus(pauseFrom, pauseTo)).toEqual({
        dateWithinPausePeriod: true,
        pauseP1DownloadFrom: '3.38pm on Thursday 27 November 2025',
        pauseP1DownloadTo: '5.38pm on Thursday 27 November 2025'
      })
    })

    it('should return true when the current date is after set pause from date, but to date is null (no end date)', () => {
      const pauseFrom = new Date(1764257880000)
      const pauseTo = null
      expect(getPausePeriodStatus(pauseFrom, pauseTo)).toEqual({
        dateWithinPausePeriod: true,
        pauseP1DownloadFrom: '3.38pm on Thursday 27 November 2025',
        pauseP1DownloadTo: null
      })
    })

    it('should return false when the current date falls outside the pause period', () => {
      const pauseFrom = new Date(1764265080000)
      const pauseTo = new Date(1764257880000)
      expect(getPausePeriodStatus(pauseFrom, pauseTo)).toEqual({
        dateWithinPausePeriod: false,
        pauseP1DownloadFrom: '5.38pm on Thursday 27 November 2025',
        pauseP1DownloadTo: '3.38pm on Thursday 27 November 2025'
      })
    })

    it('should return false and null values when no pause dates are provided', () => {
      expect(getPausePeriodStatus(null, null)).toEqual({
        dateWithinPausePeriod: false,
        pauseP1DownloadFrom: null,
        pauseP1DownloadTo: null
      })
    })
  })
})
