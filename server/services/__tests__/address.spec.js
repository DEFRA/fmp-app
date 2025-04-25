const { findByPlace, getPostcodeFromEastingorNorthing } = require('../../../server/services/address')
const { config } = require('../../../config')
const axios = require('axios')
jest.mock('axios')

const osAddressData = require('./__data__/addresses.json')
const postcodeAddresses = require('./__data__/postcodeAddresses.json')
const addressData = [
  {
    geometry_x: 425048,
    geometry_y: 564892,
    locationDetails: 'Newcastle upon Tyne, North East, England',
    isPostCode: false,
    exact: 0
  },
  {
    geometry_x: 384799,
    geometry_y: 346008,
    locationDetails: 'Newcastle-under-Lyme, Staffordshire, West Midlands, England',
    isPostCode: false,
    exact: 0
  }
]

describe('address', () => {
  it('findByPlace should call the os api with a filter applied', async () => {
    axios.get.mockResolvedValue({
      data: {
        results: osAddressData
      }
    })
    const places = await findByPlace('/pickering')
    expect(places).toEqual(addressData)
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith(config.ordnanceSurvey.osNamesUrl.replace('maxresults=1&', 'maxresults=10&') + `/pickering&key=${config.ordnanceSurvey.osSearchKey}&fq=LOCAL_TYPE:City%20LOCAL_TYPE:Hamlet%20LOCAL_TYPE:Other_Settlement%20LOCAL_TYPE:Suburban_Area%20LOCAL_TYPE:Town%20LOCAL_TYPE:PostCode%20LOCAL_TYPE:Village`)
  })

  it('findByPlace should return an empty array if payload does not exist', async () => {
    axios.get.mockResolvedValue(undefined)
    const places = await findByPlace('/pickering')
    expect(places).toEqual([])
  })

  it('findByPlace should return an empty array if payload.results does not exist', async () => {
    axios.get.mockResolvedValue({})
    const places = await findByPlace('/pickering')
    expect(places).toEqual([])
  })

  it('findByPlace should return an empty array if payload.results is an empty array', async () => {
    axios.get.mockResolvedValue({ results: [] })
    const places = await findByPlace('/pickering')
    expect(places).toEqual([])
  })

  it('getPostcodeFromEastingorNorthing should return undefined if payload does not exist', async () => {
    axios.get.mockResolvedValue('')
    const postcode = await getPostcodeFromEastingorNorthing(12345, 678910)
    expect(postcode).toEqual('')
  })

  it('getPostcodeFromEastingorNorthing should return postcode if payload exists', async () => {
    axios.get.mockResolvedValue({
      data: {
        results: [
          {
            DPA: {
              POSTCODE: 'WA1 2NN'
            }
          }
        ]
      }
    })
    const postcode = await getPostcodeFromEastingorNorthing(360799, 388244)
    expect(postcode).toEqual('WA1 2NN')
  })

  it('getPostcodeFromEastingorNorthing should return an empty string if the request fails', async () => {
    axios.get.mockImplementationOnce(() => { throw new Error('some error') })
    const postcode = await getPostcodeFromEastingorNorthing(360799, 388244)
    expect(postcode).toEqual('')
  })

  it('findByPlace should return 1st match of start of string when a partial postcode is searched', async () => {
    axios.get.mockResolvedValue({ data: { results: postcodeAddresses } })
    const places = await findByPlace('BA11 1')
    const expectedFirstResult = {
      exact: 0,
      geometry_x: 377670,
      geometry_y: 148099,
      isPostCode: true,
      locationDetails: 'BA11 1AB, Frome, Somerset, South West, England'
    }
    expect(places[0]).toEqual(expectedFirstResult)
  })

  it('findByPlace should return 1st exact match of start of string when a full postcode is searched', async () => {
    axios.get.mockResolvedValue({ data: { results: postcodeAddresses } })
    const places = await findByPlace('BA11 1AF')
    const expectedFirstResult = {
      exact: 1,
      geometry_x: 377638,
      geometry_y: 148059,
      isPostCode: true,
      locationDetails: 'BA11 1AF, Frome, Somerset, South West, England'
    }
    expect(places[0]).toEqual(expectedFirstResult)
  })

  it('findByPlace should not return any results when a non matching full postcode is searched', async () => {
    axios.get.mockResolvedValue({ data: { results: postcodeAddresses } })
    const places = await findByPlace('BT11 1AF')
    expect(places).toEqual([])
  })

  it('findByPlace should not return any results when a non matching partial postcode is searched', async () => {
    axios.get.mockResolvedValue({ data: { results: postcodeAddresses } })
    const places = await findByPlace('BT11')
    expect(places).toEqual([])
  })
})
