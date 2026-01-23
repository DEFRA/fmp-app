const {
  formatUKTimeToMinute,
  formatUKDate,
  formatUKDateTimeToMinute,
  formatUKTimeAndPauseText,
  formatUKDateTime,
  formatUKDateTimeWithTimeZone,
  calculateElapsedTime,
  markUpUkDate,
  MILLISECONDS
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
const timeZeroMinutes = 1769180400000

const tests = [
  // epoch, formatUKTimeToMinute, formatUKDate, formatUKDateTime, formatUKDateTimeWithTimeZone, formatUKDateTimeToMinute
  [january01,
    '01:01',
    '01/01/2023',
    '01/01/2023 01:01',
    '01/01/2023, 01:01:01',
    '01/01/2023, 01:01:01 GMT',
    '1:01am on Sunday 1 January 2023'
  ],
  [april12,
    '23:13',
    '12/04/2023',
    '12/04/2023 23:13',
    '12/04/2023, 23:13:02',
    '12/04/2023, 23:13:02 BST',
    '11:13pm on Wednesday 12 April 2023'
  ],
  [december12,
    '12:59',
    '04/12/2023',
    '04/12/2023 12:59',
    '04/12/2023, 12:59:59',
    '04/12/2023, 12:59:59 GMT',
    '12:59pm on Monday 4 December 2023'
  ],
  [epochStartTime,
    '12:18',
    '03/06/2023',
    '03/06/2023 12:18',
    '03/06/2023, 12:18:23',
    '03/06/2023, 12:18:23 BST',
    '12:18pm on Saturday 3 June 2023'
  ],
  [epochCloseToMidnight,
    '00:18',
    '04/06/2023',
    '04/06/2023 00:18',
    '04/06/2023, 00:18:23',
    '04/06/2023, 00:18:23 BST',
    '12:18am on Sunday 4 June 2023'
  ],
  [timeZeroMinutes,
    '15:00',
    '23/01/2026',
    '23/01/2026 15:00',
    '23/01/2026, 15:00:00',
    '23/01/2026, 15:00:00 GMT',
    '3pm on Friday 23 January 2026'
  ],
  [undefined,
    '',
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
    ['formatUKDateTimeWithTimeZone', formatUKDateTimeWithTimeZone, 5],
    ['formatUKTimeAndPauseText', formatUKTimeAndPauseText, 6]
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
      expect(formatUKTimeAndPauseText(1764265080000)).toEqual('5:38pm on Thursday 27 November 2025')
    })

    it('should format midnight correctly', () => {
      expect(formatUKTimeAndPauseText(1769126400000)).toEqual('midnight on Friday 23 January 2026')
    })

    it('should format midday correctly', () => {
      expect(formatUKTimeAndPauseText(1769169600000)).toEqual('midday on Friday 23 January 2026')
    })

    it('should return empty string for invalid date', () => {
      expect(formatUKTimeAndPauseText(null)).toEqual('')
    })
  })
})
