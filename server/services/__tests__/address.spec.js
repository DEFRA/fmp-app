require('dotenv').config({ path: 'config/.env-example' })

const { findByPlace, getPostcodeFromEastingorNorthing } = require('../../../server/services/address')
const util = require('../../../server/util')
const { config } = require('../../../config')

describe('address', () => {
  let restoreGetJson

  beforeAll(async () => {
    restoreGetJson = util.getJson
  })

  afterAll(async () => {
    util.getJson = restoreGetJson
  })

  it('findByPlace should call the os api with a filter applied', async () => {
    util.getJson = (url) => {
      const expectedUrl =
        config.ordnanceSurvey.osNamesUrl.replace('maxresults=1&', 'maxresults=10&') +
        `/pickering&key=${config.ordnanceSurvey.osSearchKey}&fq=LOCAL_TYPE:City%20LOCAL_TYPE:Hamlet%20LOCAL_TYPE:Other_Settlement%20LOCAL_TYPE:Suburban_Area%20LOCAL_TYPE:Town%20LOCAL_TYPE:PostCode%20LOCAL_TYPE:Village`

      expect(url).toEqual(expectedUrl)
    }
    await findByPlace('/pickering')
  })

  it('findByPlace should return an empty array if payload does not exist', async () => {
    util.getJson = () => undefined
    const places = await findByPlace('/pickering')
    expect(places).toEqual([])
  })

  it('findByPlace should return an empty array if payload.results does not exist', async () => {
    util.getJson = () => ({})
    const places = await findByPlace('/pickering')
    expect(places).toEqual([])
  })

  it('findByPlace should return an empty array if payload.results is an empty array', async () => {
    util.getJson = () => ({ results: [] })
    const places = await findByPlace('/pickering')
    expect(places).toEqual([])
  })

  it('findByPlace should return an array of geometry items if payload.results is valid', async () => {
    util.getJson = () => ({
      results: [
        {
          GAZETTEER_ENTRY: {
            GEOMETRY_X: 123,
            GEOMETRY_Y: 456
          }
        }
      ]
    })
    const places = await findByPlace('/pickering')
    expect(places).toEqual([
      { exact: 0, geometry_x: 123, geometry_y: 456, isPostCode: false, locationDetails: '' }
    ])
  })

  const apiResults = [
    {
      GAZETTEER_ENTRY: {
        NAME1: 'CF10 1FJ',
        POPULATED_PLACE: 'Caerdydd / Cardiff',
        COUNTY_UNITARY: 'Caerdydd - Cardiff',
        REGION: 'Wales',
        COUNTRY: 'Wales'
      },
      expectedLocationDetails: 'CF10 1FJ, Caerdydd / Cardiff, Caerdydd - Cardiff, Wales'
    },
    {
      GAZETTEER_ENTRY: {
        NAME1: 'M1 1AD',
        POPULATED_PLACE: 'Manchester',
        DISTRICT_BOROUGH: 'Manchester',
        REGION: 'North West',
        COUNTRY: 'England'
      },
      expectedLocationDetails: 'M1 1AD, Manchester, North West, England'
    },
    {
      GAZETTEER_ENTRY: {
        NAME1: 'BD1 5DA',
        POPULATED_PLACE: 'Bradford',
        DISTRICT_BOROUGH: 'Bradford',
        REGION: 'Yorkshire and the Humber',
        COUNTRY: 'England',
        COUNTRY_URI: 'http://data.ordnancesurvey.co.uk/id/country/england'
      },
      expectedLocationDetails: 'BD1 5DA, Bradford, Yorkshire and the Humber, England'
    },
    {
      GAZETTEER_ENTRY: {
        NAME1: 'NG1 1AA',
        POPULATED_PLACE: 'Nottingham',
        COUNTY_UNITARY: 'City of Nottingham',
        REGION: 'East Midlands',
        COUNTRY: 'England'
      },
      expectedLocationDetails: 'NG1 1AA, Nottingham, City of Nottingham, East Midlands, England'
    },
    {
      GAZETTEER_ENTRY: {
        NAME1: 'Nottingham',
        COUNTY_UNITARY: 'City of Nottingham',
        REGION: 'East Midlands',
        COUNTRY: 'England'
      },
      expectedLocationDetails: 'Nottingham, City of Nottingham, East Midlands, England'
    }
  ]
  it('findByPlace should populate locationDetails with an address description', async () => {
    util.getJson = () => ({
      results: apiResults
    })
    const places = await findByPlace('/pickering')
    places.forEach(({ locationDetails }, index) =>
      expect(locationDetails).toEqual(apiResults[index].expectedLocationDetails)
    )
  })

  it('getPostcodeFromEastingorNorthing should return undefined if payload does not exist', async () => {
    util.getJson = () => ''
    const postcode = await getPostcodeFromEastingorNorthing(12345, 678910)
    expect(postcode).toEqual('')
  })

  it('getPostcodeFromEastingorNorthing should return postcode if payload exists', async () => {
    util.getJson = () => ({
      results: [
        {
          DPA: {
            POSTCODE: 'WA1 2NN'
          }
        }
      ]
    })
    const postcode = await getPostcodeFromEastingorNorthing(360799, 388244)
    expect(postcode).toEqual('WA1 2NN')
  })
})
