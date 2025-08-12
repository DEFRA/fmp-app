const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')
const constants = require('../../constants')

const url = constants.routes.ENGLAND_ONLY

describe('England Only Page', () => {
  const getQueries = [{
    testName: 'Happy get: with postcode',
    queryParams: {
      easting: '123456',
      northing: '123456',
      locationDetails: 'Some address in Wales',
      isPostCode: true,
      placeOrPostcode: 'SY16 1AA'
    },
    text: 'Your search for \'SY16 1AA\' has been placed in Some address in Wales'
  }, {
    testName: 'Happy get: with place',
    queryParams: {
      easting: '123456',
      northing: '123456',
      locationDetails: 'Some address in Wales',
      isPostCode: false,
      placeOrPostcode: 'Swansea'
    },
    text: 'Your search for \'Swansea\' has been placed in Some address in Wales'
  }, {
    testName: 'Happy get: with NGR',
    queryParams: {
      easting: '123456',
      northing: '123456',
      nationalGridReference: 'SN 85981 88534'
    },
    text: 'The location you submitted is not in England, or is only partly in England.'
  }, {
    testName: 'Happy get: with easting and northing',
    queryParams: {
      easting: '123456',
      northing: '123456'
    },
    text: 'The location you submitted is not in England, or is only partly in England.'
  }]
  getQueries.forEach(({ testName, queryParams, text }) => {
    it(testName, async () => {
      const response = await submitGetRequest({ url: `${url}?${new URLSearchParams(queryParams).toString()}` }, 'This service provides data for locations in England only')
      document.body.innerHTML = response.payload
      assertCopy('title', 'This service provides data for locations in England only - Flood map for planning - GOV.UK')
      assertCopy('#not-england-page > div > p:nth-child(2)', text)
    })
  })

  it('england-only with no params', async () => {
    const response = await submitGetRequest({ url: `${url}?${new URLSearchParams({}).toString()}` }, 'This service provides data for locations in England only')
    expect(response.result).toMatchSnapshot()
  })
})
