'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const floodService = require('../../server/services/flood')

const isEngland = () => {
  return { is_england: true }
}

lab.experiment('location service test', () => {
  let sandbox

  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  lab.beforeEach(async () => {
    delete require.cache[require.resolve('../../server/services/location')]
    sandbox = await sinon.createSandbox()
  })

  lab.afterEach(async () => {
    await sandbox.restore()
  })

  // lab.test('Check location service exists', () => {
  //   Code.expect(location).to.be.a.object()
  // })

  lab.test('Check for invalid location', async () => {
    const fakeLocationData = () => {
      return {}
    }

    const util = require('../../server/util')

    sandbox.stub(util, 'getJson').callsFake(fakeLocationData)
    sandbox.stub(floodService, 'getIsEngland').callsFake(isEngland)

    const location = require('../../server/services/location')

    const result = await location.find('Invalid').then((resolvedValue) => {
      return resolvedValue
    }, (error) => {
      return error
    })

    await Code.expect(result).to.be.a.object()
    await Code.expect(result.Error).to.be.true
    await Code.expect(result.message).to.equal('Invalid geocode results (no resourceSets)')
  })

  lab.test('Check for valid location', async () => {
    const util = require('../../server/util')

    const fakeLocationData = () => {
      return {
        authenticationResultCode: 'ValidCredentials 1',
        brandLogoUri: 'http://dev.virtualearth.net/Branding/logo_powered_by.png',
        copyright: 'Copyright © 2019 Microsoft and its suppliers. All rights reserved. This API cannot be accessed and the content and any results may not be used, reproduced or transmitted in any manner without express written permission from Microsoft Corporation.',
        resourceSets: [
          {
            estimatedTotal: 1,
            resources: [
              {
                __type: 'Location:http://schemas.microsoft.com/search/local/ws/rest/v1',
                bbox: [49.957805633544922, -18.279674530029297, 60.782192230224609, 12.539674758911133],
                name: 'United Kingdom',
                point: { type: 'Point', coordinates: [53.9438362121582, -2.5505640506744385] },
                address: {
                  countryRegion: 'United Kingdom',
                  formattedAddress: 'United Kingdom',
                  countryRegionIso2: 'GB'
                },
                confidence: 'High',
                entityType: 'CountryRegion',
                geocodePoints: [
                  {
                    type: 'Point',
                    coordinates: [53.9438362121582, -2.5505640506744385],
                    calculationMethod: 'Rooftop',
                    usageTypes: ['Display']
                  }
                ],
                matchCodes: ['UpHierarchy']
              }
            ]
          }
        ],
        statusCode: 200,
        statusDescription: 'OK',
        traceId: '8e730b29a377433eb4b5f7a0ede6810b|DU00000B74|7.7.0.0|Ref A: BB9C9D05115F48BDA6C70C0A40AB8304 Ref B: DB3EDGE1510 Ref C: 2019-07-31T14:43:28Z'
      }
    }

    sandbox.stub(util, 'getJson').callsFake(fakeLocationData)
    sandbox.stub(floodService, 'getIsEngland').callsFake(isEngland)

    const location = require('../../server/services/location')

    const result = await location.find('Preston').then((resolvedValue) => {
      return resolvedValue
    }, (error) => {
      return error
    })

    await Code.expect(result).to.be.a.object()
    await Code.expect(result.Error).to.be.false
    await Code.expect(result.address).to.equal('United Kingdom')
  })

  lab.test('Check for Bing call returning low confidence and hence no results', async () => {
    const util = require('../../server/util')

    const fakeLocationData = () => {
      return {
        authenticationResultCode: 'ValidCredentials 2',
        brandLogoUri: 'http://dev.virtualearth.net/Branding/logo_powered_by.png',
        copyright: 'Copyright © 2019 Microsoft and its suppliers. All rights reserved. This API cannot be accessed and the content and any results may not be used, reproduced or transmitted in any manner without express written permission from Microsoft Corporation.',
        resourceSets: [
          {
            estimatedTotal: 1,
            resources: [
              {
                __type: 'Location:http://schemas.microsoft.com/search/local/ws/rest/v1',
                bbox: [49.957805633544922, -18.279674530029297, 60.782192230224609, 12.539674758911133],
                name: 'United Kingdom',
                point: { type: 'Point', coordinates: [53.9438362121582, -2.5505640506744385] },
                address: {
                  countryRegion: 'United Kingdom',
                  formattedAddress: 'United Kingdom',
                  countryRegionIso2: 'GB'
                },
                confidence: 'Low',
                entityType: 'CountryRegion',
                geocodePoints: [
                  {
                    type: 'Point',
                    coordinates: [53.9438362121582, -2.5505640506744385],
                    calculationMethod: 'Rooftop',
                    usageTypes: ['Display']
                  }
                ],
                matchCodes: ['UpHierarchy']
              }
            ]
          }
        ],
        statusCode: 200,
        statusDescription: 'OK',
        traceId: '8e730b29a377433eb4b5f7a0ede6810b|DU00000B74|7.7.0.0|Ref A: BB9C9D05115F48BDA6C70C0A40AB8304 Ref B: DB3EDGE1510 Ref C: 2019-07-31T14:43:28Z'
      }
    }

    sandbox.stub(util, 'getJson').callsFake(fakeLocationData)
    sandbox.stub(floodService, 'getIsEngland').callsFake(isEngland)

    const location = require('../../server/services/location')

    const result = await location.find('Preston').then((resolvedValue) => {
      return resolvedValue
    }, (error) => {
      return error
    })

    await Code.expect(result).to.be.undefined()
  })

  lab.test('Check for Bing call returning medium confidence and hence no results', async () => {
    const util = require('../../server/util')

    const fakeLocationData = () => {
      return {
        authenticationResultCode: 'ValidCredentials 3',
        brandLogoUri: 'brand-logo-uri',
        copyright: 'Copyright ',
        resourceSets: [
          {
            estimatedTotal: 1,
            resources: [
              {
                __type: 'Location:http://schemas.microsoft.com/search/local/ws/rest/v1',
                bbox: [49.957805633544922, -18.279674530029297, 60.782192230224609, 12.539674758911133],
                name: 'United Kingdom',
                point: { type: 'Point', coordinates: [53.9438362121582, -2.5505640506744385] },
                address: {
                  countryRegion: 'United Kingdom',
                  formattedAddress: 'United Kingdom',
                  countryRegionIso2: 'GB'
                },
                confidence: 'Medium',
                entityType: 'CountryRegion',
                geocodePoints: [
                  {
                    type: 'Point',
                    coordinates: [53.9438362121582, -2.5505640506744385],
                    calculationMethod: 'Rooftop',
                    usageTypes: ['Display']
                  }
                ],
                matchCodes: ['UpHierarchy']
              }
            ]
          }
        ],
        statusCode: 200,
        statusDescription: 'OK',
        traceId: 'trace-id'
      }
    }

    sandbox.stub(util, 'getJson').callsFake(fakeLocationData)
    sandbox.stub(floodService, 'getIsEngland').callsFake(isEngland)

    const location = require('../../server/services/location')

    const result = await location.find('Preston').then((resolvedValue) => {
      return resolvedValue
    }, (error) => {
      return error
    })

    await Code.expect(result).to.be.undefined()
  })

  lab.test('Check for Bing call returning no data resources and hence no results', async () => {
    const util = require('../../server/util')

    const fakeLocationData = () => {
      return {
        authenticationResultCode: 'ValidCredentials 4',
        brandLogoUri: 'http://dev.virtualearth.net/Branding/logo_powered_by.png',
        copyright: 'Copyright © 2019 Microsoft and its suppliers. All rights reserved. This API cannot be accessed and the content and any results may not be used, reproduced or transmitted in any manner without express written permission from Microsoft Corporation.',
        resourceSets: [
          {
            estimatedTotal: 0,
            resources: []
          }
        ],
        statusCode: 200,
        statusDescription: 'OK',
        traceId: '8e730b29a377433eb4b5f7a0ede6810b|DU00000B74|7.7.0.0|Ref A: BB9C9D05115F48BDA6C70C0A40AB8304 Ref B: DB3EDGE1510 Ref C: 2019-07-31T14:43:28Z'
      }
    }

    sandbox.stub(util, 'getJson').callsFake(fakeLocationData)
    sandbox.stub(floodService, 'getIsEngland').callsFake(isEngland)

    const location = require('../../server/services/location')

    const result = await location.find('Preston').then((resolvedValue) => {
      return resolvedValue
    }, (error) => {
      return error
    })

    await Code.expect(result).to.be.undefined()
  })

  lab.test('Check for Bing call returning invalid query', async () => {
    const util = require('../../server/util')

    const fakeLocationData = () => {
      return {
        authenticationResultCode: 'ValidCredentials 5',
        brandLogoUri: 'http://dev.virtualearth.net/Branding/logo_powered_by.png',
        copyright: 'Copyright © 201 Microsoft and its suppliers. All rights reserved. This API cannot be accessed and the content and any results may not be used, reproduced or transmitted in any manner without express written permission from Microsoft Corporation.',
        errorDetails: [
          'One or more parameters are not valid.',
          'query: This parameter is missing or invalid.'
        ],
        resourceSets: [],
        statusCode: 400,
        statusDescription: 'Bad Request',
        traceId: '909b39c32124486fa830b95324d23d79|DU00000D6B|7.7.0.0'
      }
    }

    sandbox.stub(util, 'getJson').callsFake(fakeLocationData)
    sandbox.stub(floodService, 'getIsEngland').callsFake(isEngland)

    const location = require('../../server/services/location')

    const result = await location.find('').then((resolvedValue) => {
      return resolvedValue
    }, (error) => {
      return error
    })

    await Code.expect(result).to.be.a.object()
    await Code.expect(result.Error).to.be.true
    await Code.expect(result.message).to.equal('Invalid geocode results (no resourceSets)')
  })

  lab.test('Check for Bing call returning duplicate location name in description', async () => {
    const util = require('../../server/util')

    const fakeLocationData = () => {
      return {
        authenticationResultCode: 'ValidCredentials 6',
        brandLogoUri: 'http://dev.virtualearth.net/Branding/logo_powered_by.png',
        copyright: 'Copyright © 2019 Microsoft and its suppliers. All rights reserved. This API cannot be accessed and the content and any results may not be used, reproduced or transmitted in any manner without express written permission from Microsoft Corporation.',
        resourceSets: [
          {
            estimatedTotal: 1,
            resources: [
              {
                __type: 'Location:http://schemas.microsoft.com/search/local/ws/rest/v1',
                bbox: [53.367538452148437, -2.6395580768585205, 53.420841217041016, -2.5353000164031982],
                name: 'Warrington, Warrington',
                point: {
                  type: 'Point',
                  coordinates: [53.393871307373047, -2.5893499851226807]
                },
                address: {
                  adminDistrict: 'England',
                  adminDistrict2: 'Warrington',
                  countryRegion: 'United Kingdom',
                  formattedAddress: 'Warrington, Warrington',
                  locality: 'Warrington',
                  countryRegionIso2: 'GB'
                },
                confidence: 'Medium',
                entityType: 'PopulatedPlace',
                geocodePoints: [
                  {
                    type: 'Point',
                    coordinates: [53.393871307373047, -2.5893499851226807],
                    calculationMethod: 'Rooftop',
                    usageTypes: ['Display']
                  }
                ],
                matchCodes: ['Good']
              }
            ]
          }
        ],
        statusCode: 200,
        statusDescription: 'OK',
        traceId: 'b755f46d8f4e48a88e6e8a76c94aa775|DU00000D65|7.7.0.0|Ref A: 2D76360D146B4861AB917B06CE6569DE Ref B: DB3EDGE1113 Ref C: 2019-08-01T11:08:17Z'
      }
    }

    sandbox.stub(util, 'getJson').callsFake(fakeLocationData)
    sandbox.stub(floodService, 'getIsEngland').callsFake(isEngland)

    const location = require('../../server/services/location')

    const result = await location.find('').then((resolvedValue) => {
      return resolvedValue
    }, (error) => {
      return error
    })

    await Code.expect(result).to.be.a.object()
    await Code.expect(result.Error).to.be.false
    await Code.expect(result.name).to.equal('Warrington')
  })

  lab.test('Check for Bing valid autosuggest call ', async () => {
    const util = require('../../server/util')

    const fakeLocationData = () => {
      return {
        authenticationResultCode: 'ValidCredentials 7',
        brandLogoUri: 'http://dev.virtualearth.net/Branding/logo_powered_by.png',
        copyright: 'Copyright © 2019 Microsoft and its suppliers. All rights reserved. This API cannot be accessed and the content and any results may not be used, reproduced or transmitted in any manner without express written permission from Microsoft Corporation.',
        resourceSets: [
          {
            estimatedTotal: 1,
            resources: [
              {
                __type: 'Autosuggest:http://schemas.microsoft.com/search/local/ws/rest/v1',
                value: [
                  {
                    __type: 'Place',
                    address: {
                      countryRegion: 'United Kingdom',
                      locality: 'Worcester',
                      adminDistrict: 'England',
                      adminDistrict2: 'Worcestershire',
                      countryRegionIso2: 'GB',
                      formattedAddress: 'Worcester'
                    }
                  },
                  {
                    __type: 'Place',
                    address: {
                      countryRegion: 'United Kingdom',
                      locality: 'Warrenpoint, Newry',
                      adminDistrict: 'Northern Ireland',
                      adminDistrict2: 'Newry and Mourne',
                      countryRegionIso2: 'GB',
                      formattedAddress: 'Warrenpoint, Newry'
                    }
                  },
                  {
                    __type: 'Place',
                    address: {
                      countryRegion: 'United Kingdom',
                      locality: 'Winchester',
                      adminDistrict: 'England',
                      adminDistrict2: 'Hampshire',
                      countryRegionIso2: 'GB',
                      formattedAddress: 'Winchester'
                    }
                  },
                  {
                    __type: 'Place',
                    address: {
                      countryRegion: 'United Kingdom',
                      locality: 'Watford',
                      adminDistrict: 'England',
                      adminDistrict2: 'Hertfordshire',
                      countryRegionIso2: 'GB',
                      formattedAddress: 'Watford'
                    }
                  }
                ]
              }
            ]
          }
        ],
        statusCode: 200,
        statusDescription: 'OK',
        traceId: '42423f627cef480b8a169411cbef096e|DU00000D6B|7.7.0.0'
      }
    }

    sandbox.stub(util, 'getJson').callsFake(fakeLocationData)

    const location = require('../../server/services/location')
    sandbox.stub(floodService, 'getIsEngland').callsFake(isEngland)

    const result = await location.suggest('W').then((resolvedValue) => {
      return resolvedValue
    }, (error) => {
      return error
    })

    await Code.expect(result).to.be.an.array()
    await Code.expect(result.Error).to.be.false
  })

  lab.test('Check for Bing empty autosuggest call ', async () => {
    const util = require('../../server/util')

    const fakeLocationData = () => {
      return {
        authenticationResultCode: 'ValidCredentials 8',
        brandLogoUri: 'http://dev.virtualearth.net/Branding/logo_powered_by.png',
        copyright: 'Copyright © 2019 Microsoft and its suppliers. All rights reserved. This API cannot be accessed and the content and any results may not be used, reproduced or transmitted in any manner without express written permission from Microsoft Corporation.',
        resourceSets: [
          {
            estimatedTotal: 1,
            resources: [
              {
                __type: 'Autosuggest:http://schemas.microsoft.com/search/local/ws/rest/v1',
                value: []
              }
            ]
          }
        ],
        statusCode: 200,
        statusDescription: 'OK',
        traceId: '42423f627cef480b8a169411cbef096e|DU00000D6B|7.7.0.0'
      }
    }

    sandbox.stub(util, 'getJson').callsFake(fakeLocationData)
    sandbox.stub(floodService, 'getIsEngland').callsFake(isEngland)

    const location = require('../../server/services/location')

    const result = await location.suggest('W').then((resolvedValue) => {
      return resolvedValue
    }, (error) => {
      return error
    })

    await Code.expect(result).to.be.an.array()
    await Code.expect(result.Error).to.be.false
  })

  lab.test('Check for Bing auto suggest no with no query and hence no results', async () => {
    const util = require('../../server/util')

    const fakeLocationData = () => {
      return {
      }
    }

    sandbox.stub(util, 'getJson').callsFake(fakeLocationData)
    sandbox.stub(floodService, 'getIsEngland').callsFake(isEngland)

    const location = require('../../server/services/location')

    const result = await location.suggest('W').then((resolvedValue) => {
      return resolvedValue
    }, (error) => {
      return error
    })

    await Code.expect(result).to.be.a.object()
    await Code.expect(result.Error).to.be.true
    await Code.expect(result.message).to.equal('Invalid geocode results (no resourceSets)')
  })

  lab.test('Check for Bing auto suggest with estimatedTotal = 0', async () => {
    const util = require('../../server/util')

    const fakeLocationData = () => {
      return {
        authenticationResultCode: 'ValidCredentials 9',
        brandLogoUri: 'http://dev.virtualearth.net/Branding/logo_powered_by.png',
        copyright: 'Copyright © 2019 Microsoft and its suppliers. All rights reserved. This API cannot be accessed and the content and any results may not be used, reproduced or transmitted in any manner without express written permission from Microsoft Corporation.',
        resourceSets: [
          {
            estimatedTotal: 0
            // resources: [
            //   {
            //     __type: 'Autosuggest:http://schemas.microsoft.com/search/local/ws/rest/v1',
            //     value: []
            //   }
            // ]
          }
        ],
        statusCode: 200,
        statusDescription: 'OK',
        traceId: '42423f627cef480b8a169411cbef096e|DU00000D6B|7.7.0.0'
      }
    }

    sandbox.stub(util, 'getJson').callsFake(fakeLocationData)
    sandbox.stub(floodService, 'getIsEngland').callsFake(isEngland)

    const location = require('../../server/services/location')

    const result = await location.suggest('W').then((resolvedValue) => {
      return resolvedValue
    }, (error) => {
      return error
    })

    await Code.expect(result).to.be.undefined()
  })
})
