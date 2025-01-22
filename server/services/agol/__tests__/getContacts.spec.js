const { getContacts } = require('../getContacts')
const mockPolygons = require('../../__data__/mockPolygons.json')
jest.mock('../getCustomerTeam')
jest.mock('../getLocalAuthority')

describe('getContacts', () => {
  it('should return the combined contents of getCustomerTeam and getLocalAuthority for a polygon', async () => {
    const response = await getContacts({
      geometryType: 'esriGeometryPolygon',
      polygon: mockPolygons.fz1_only
    })
    expect(response).toEqual({
      LocalAuthorities: 'North Yorkshire',
      isEngland: true,
      EmailAddress: 'neyorkshire@environment-agency.gov.uk',
      AreaName: 'Yorkshire',
      useAutomatedService: true
    })
  })

  it('should return the combined contents of getCustomerTeam and getLocalAuthority for a point', async () => {
    const response = await getContacts({
      geometryType: 'esriGeometryPoint',
      x: 123,
      y: 456
    })
    expect(response).toEqual({
      LocalAuthorities: 'Winchester',
      isEngland: true,
      EmailAddress: 'wessexenquiries@environment-agency.gov.uk',
      AreaName: 'Wessex',
      useAutomatedService: false
    })
  })
})
