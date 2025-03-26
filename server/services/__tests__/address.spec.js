const { findByPlace, getPostcodeFromEastingorNorthing } = require('../../../server/services/address')
const { config } = require('../../../config')
const axios = require('axios')
jest.mock('axios')

const osAddressData = require('./__data__/addresses.json')
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
})
