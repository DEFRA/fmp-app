'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const Outlook = require('../../server/models/outlook')

lab.experiment('Outlook model test', () => {
  let sandbox

  const outlookFakeData = {
    id: 1107,
    issued_at: '2019-08-08T09:30:00Z',
    pdf_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01107-2019-08-08_1030/fgs.pdf',
    detailed_csv_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01107-2019-08-08_1030/detailed.csv',
    area_of_concern_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01107-2019-08-08_1030/areaofconcern.jpg',
    flood_risk_trend:
    {
      day1: 'stable',
      day2: 'stable',
      day3: 'stable',
      day4: 'increasing',
      day5: 'increasing'
    },
    sources:
      [{ surface: 'The surface water flood risk is LOW.\n\nSignificant surface water flooding impacts are possible but not expected across many parts of England and Wales on Friday due to widespread rain and heavy showers. Significant surface water flooding impacts are possible but not expected from thunderstorms on Saturday and Sunday across parts of the north of England.\n\nMinor surface water flooding impacts are possible but not expected from heavy showers on Monday across parts of the north of England and Wales.\n' },
        { river: 'The river flood risk is LOW.\n\nSignificant river flooding impacts are possible but not expected across parts of the north Midlands and the north of England on Friday due to widespread rain and heavy showers. Significant river flooding impacts are possible but not expected from thunderstorms on Saturday and Sunday across parts of the north of England. Urban watercourses and small, fast responding river catchments are most at risk.\n\nMinor river flooding impacts are possible but not expected from heavy showers on Monday across parts of the north of England and Wales.\n\nThe ongoing situation at Toddbrook Reservoir is being managed by the relevant agencies to minimise the risk of flooding and has not been specifically shown on this product.' },
        { coastal: 'The coastal/tidal flood risk is VERY LOW for the next five days.' },
        { ground: 'The groundwater flood risk is VERY LOW for the next five days.' }],
    headline: 'Significant surface water and river flooding impacts are possible but not expected across parts of England and Wales on Friday, and across parts of the north of England on Saturday and Sunday. The overall flood risk is LOW.',
    amendments: '',
    future_forecast: '',
    last_modified_at: '2019-08-08T09:27:22Z',
    next_issue_due_at: '2019-08-09T09:30:00Z',
    png_thumbnails_with_days_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01107-2019-08-08_1030/FGSthumbnails-with-days.png',
    risk_areas:
      [{
        id: 1950,
        statement_id: 1105,
        updated_at: '2019-08-06T09:22:29Z',
        beyond_five_days: false,
        ordering: 2,
        risk_area_blocks: [
          {
            id: 2035,
            days: [5],
            risk_area_id: 1950,
            risk_levels: {
              river: [2, 2],
              surface: [2, 2],
              coastal: [2, 2]
            },
            additional_information: 'Heavy thundery showers. Urban areas and small catchments most at risk.',
            polys:
              [
                {
                  id: 2660,
                  coordinates:
                    [
                      [
                        [-4.174804687500001, 54.625522440842246],
                        [-3.146484643220902, 54.96247882239579],
                        [-2.531250268220902, 55.36412729483159],
                        [-2.3994143307209015, 55.65031856976615],
                        [-1.9599612057209017, 55.90980992336868],
                        [0.47141432762146, 53.83838539206968],
                        [0.21972656250000003, 53.32848623940286],
                        [-4.630237072706223, 53.13119286673744],
                        [-4.174804687500001, 54.625522440842246]
                      ]
                    ],
                  area: 8.42310580332646,
                  label_position: [-2.08465592935681, 54.1276207351252],
                  poly_type: 'inland',
                  risk_area_block_id: 2035,
                  counties: [
                    {
                      name: 'Lincolnshire'
                    }
                  ]
                }
              ]
          }
        ]
      }
      ],
    aoc_maps:
      [{
        id: 1183,
        title: 'Specific Areas of Concern Map 3 - Sunday 11 August',
        ordering: 2,
        caption: '',
        ratio: [Array],
        statement_id: 1107,
        polys: [Array]
      }],
    public_forecast:
    {
      id: 1107,
      english_forecast: 'Local flooding from surface water and rivers is possible but not expected in places across much of the north of England on Friday due to widespread rain and heavy showers. Local flooding from rivers is possible, and flooding from surface water possible but not expected, across Wales and much of central and southern England on Friday.\nFurther local flooding from surface water and rivers is possible but not expected on Saturday and Sunday in parts of northern England due to heavy, thundery showers.\nLocal minor river and surface water flooding impacts are possible but not expected in parts of the north of England on Monday.\n\nProperties may flood and there may be travel disruption.',
      welsh_forecast: 'Mae llifogydd lleol o ddŵr wyneb ac afonydd yn bosibl ond nid yn ddisgwyliedig mewn mannau ar draws rhan fwyaf o ogledd Lloegr ar ddydd Gwener, o ganlyniad i law eang a chawodydd trwm. Mae llifogydd lleol o afonydd yn bosibl, a llifogydd o ddŵr wyneb yn bosibl ond heb eu disgwyl, ar draws Cymru a llawer o Ganolbarth a De Lloegr ar ddydd Gwener.\n\nMae\'n bosibl bydd llifogydd lleol pellach o ddŵr wyneb ac afonydd, ond heb eu disgwyl, ar ddydd Sadwrn a dydd Sul mewn rhannau o ogledd Lloegr oherwydd cawodydd trwm a stormydd. \n\nBydd siawns o effaith lifogydd o afonydd a dwr wyneb lleol mewn rhannau o Ogledd Lloegr ar Ddydd Llun ond nid yw hyn yn ddisgwyliedig. \n\nGall eiddo orlifo ac mae \'n bosibl y bydd tarfu ar deithio.\n',
      england_forecast: 'Service not available.',
      wales_forecast_english: 'Service not available.',
      wales_forecast_welsh: 'Service not available.',
      published_at: '2019-08-08T11:06:48Z'
    }
  }

  const outlook = new Outlook(outlookFakeData)

  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  lab.beforeEach(async () => {
    sandbox = await sinon.createSandbox()
  })
  lab.afterEach(async () => {
    await sandbox.restore()
  })
  lab.test('Check outlook issueDate', async () => {
    const outlook = new Outlook(outlookFakeData)

    const Result = await outlook.issueDate

    Code.expect(JSON.stringify(Result)).to.be.equal('"2019-08-08T09:30:00.000Z"')
  })
  lab.test('Check outlook timestampOutlook', async () => {
    const Result = await outlook.timestampOutlook

    Code.expect(Result).to.be.equal(1565256600000)
  })
  lab.test('Check outlook hasOutlookConcern', async () => {
    const Result = await outlook.hasOutlookConcern

    Code.expect(Result).to.be.equal(true)
  })
  lab.test('Check outlook geoJson', async () => {
    const Result = await outlook.geoJson

    const geoOutput = {
      features:
        [{
          geometry:
          {
            coordinates:
              [[[-3.6927796667441735, 54.78347074469547],
                [-3.62850966397673, 54.80453051854256],
                [-3.5658532771049076, 54.82584299586967],
                [-3.504810506128707, 54.84740817667679],
                [-3.4453813510481277, 54.86922606096391],
                [-3.38756581186317, 54.89129664873104],
                [-3.3313638885738337, 54.91361993997818],
                [-3.276775581180119, 54.93619593470533],
                [-3.2238008896820256, 54.95902463291249],
                [-3.1724398140795538, 54.98210603459966],
                [-3.1226923543727034, 55.00544013976683],
                [-3.0745585105614746, 55.029026948414014],
                [-3.028038282645867, 55.05286646054121],
                [-2.9831316706258812, 55.07695867614841],
                [-2.939838674501517, 55.10130359523562],
                [-2.898159294272774, 55.12590121780285],
                [-2.858093529939652, 55.15075154385008],
                [-2.819641381502152, 55.17585457337731],
                [-2.7830775082111363, 55.20050659822681],
                [-2.748401910066605, 55.22470761839857],
                [-2.715614587068558, 55.248457633892585],
                [-2.6847155392169957, 55.271756644708866],
                [-2.6557047665119176, 55.294604650847404],
                [-2.628582268953324, 55.31700165230821],
                [-2.6033480465412144, 55.338947649091274],
                [-2.5800020992755894, 55.3604426411966],
                [-2.558544427156449, 55.38148662862419],
                [-2.5389750301837926, 55.40207961137403],
                [-2.5212939083576207, 55.42222158944613],
                [-2.505501061677933, 55.4419125628405],
                [-2.49159649014473, 55.46115253155712],
                [-2.4795801937580113, 55.479941495596016],
                [-2.469452172517777, 55.498279454957164],
                [-2.4612124264240265, 55.516166409640576],
                [-2.4517710506916046, 55.53394906775628],
                [-2.441128045320511, 55.55162742930429],
                [-2.4292834103107452, 55.56920149428459],
                [-2.4162371456623077, 55.58667126269719],
                [-2.4019892513751984, 55.60403673454208],
                [-2.386539727449417, 55.621297909819276],
                [-2.369888573884964, 55.63845478852876],
                [-2.352035790681839, 55.655507370670534],
                [-2.332981377840042, 55.672455656244615],
                [-2.3127253353595734, 55.689299645251],
                [-2.2912676632404327, 55.706039337689674],
                [-2.2686083614826202, 55.72267473356064],
                [-2.244747430086136, 55.7392058328639],
                [-2.2196848690509796, 55.75563263559947],
                [-2.1934206783771515, 55.77195514176733],
                [-2.1659548580646515, 55.78817335136749],
                [-2.130708090844564, 55.79528642079225],
                [-2.0876803767168894, 55.79329435004161],
                [-2.0368717156816274, 55.78219713911558],
                [-1.978282107738778, 55.761994788014164],
                [-1.9119115528883412, 55.73268729673734],
                [-1.8377600511303172, 55.69427466528511],
                [-1.7558276024647057, 55.64675689365749],
                [-1.6661142068915071, 55.59013398185448],
                [-1.568619864410721, 55.524405929876075],
                [-1.4633445750223475, 55.449572737722264],
                [-1.3502883387263866, 55.36563440539306],
                [-1.2294511555228385, 55.27259093288846],
                [-1.100833025411703, 55.170442320208466],
                [-0.96443394839298, 55.05918856735306],
                [-0.8202539244666698, 54.93882967432227],
                [-0.6682929536327722, 54.80936564111609],
                [-0.5268126988084988, 54.686001316420175],
                [-0.3958131599938498, 54.56873670023456],
                [-0.27529433718882507, 54.45757179255922],
                [-0.16525623039342463, 54.35250659339415],
                [-0.06569883960764855, 54.253541102739376],
                [0.023377835168503246, 54.16067532059489],
                [0.10197379393503073, 54.07390924696067],
                [0.17008903669193393, 53.993242881836736],
                [0.2277235634392128, 53.918676225223095],
                [0.27487737417686736, 53.85020927711972],
                [0.3115504689048976, 53.78784203752663],
                [0.3377428476233036, 53.731574506443835],
                [0.35345451033208525, 53.68140668387131],
                [0.3586854570312426, 53.63733856980906],
                [0.35343568772077566, 53.59937016425711],
                [0.3377052024006844, 53.56750146721543],
                [0.30401270196307456, 53.53685388650188],
                [0.2523581864079461, 53.507427422116464],
                [0.18274165573529905, 53.47922207405918],
                [0.09516310994513336, 53.45223784233003],
                [-0.010377450962550938, 53.426474726929],
                [-0.13388002698775386, 53.401932727856114],
                [-0.2753446181304754, 53.37861184511135],
                [-0.4347712243907155, 53.35651207869472],
                [-0.6121598457684743, 53.33563342860622],
                [-0.8075104822637516, 53.31597589484585],
                [-1.0208231338765477, 53.29753947741361],
                [-1.2520978006068622, 53.2803241763095],
                [-1.5013344824546955, 53.26432999153352],
                [-1.768533179420047, 53.24955692308566],
                [-2.0536938915029177, 53.23600497096594],
                [-2.3568166187033066, 53.223674135174356],
                [-2.6392151426989594, 53.21795120151859],
                [-2.900889463489876, 53.21883616999863],
                [-3.1418395810760567, 53.22632904061451],
                [-3.362065495457501, 53.240429813366205],
                [-3.5615672066342094, 53.26113848825373],
                [-3.7403447146061817, 53.28845506527706],
                [-3.898398019373418, 53.322379544436224],
                [-4.035727120935918, 53.36291192573121],
                [-4.152332019293682, 53.41005220916201],
                [-4.2482127144467094, 53.463800394728636],
                [-4.323369206395001, 53.52415648243108],
                [-4.377801495138557, 53.591120472269345],
                [-4.411509580677376, 53.664692364243436],
                [-4.424493463011459, 53.744872158353346],
                [-4.416753142140807, 53.831659854599074],
                [-4.388288618065418, 53.92505545298062],
                [-4.357586251571775, 54.01393006232877],
                [-4.32464604265988, 54.09828368264351],
                [-4.2894679913297304, 54.178116313924846],
                [-4.252052097581328, 54.25342795617278],
                [-4.212398361414672, 54.32421860938731],
                [-4.170506782829762, 54.39048827356845],
                [-4.1263773618265995, 54.45223694871618],
                [-4.080010098405183, 54.50946463483049],
                [-4.0314049925655135, 54.562171331911415],
                [-3.9805620443075904, 54.610357039958934],
                [-3.927481253631414, 54.654021758973045],
                [-3.872162620536984, 54.69316548895376],
                [-3.8146061450243005, 54.727788229901066],
                [-3.7548118270933637, 54.75788998181497],
                [-3.6927796667441735, 54.78347074469547]]],
            type: 'Polygon'
          },
          properties:
          {
            day: 5,
            html: '<p class="govuk-body-s">Details of source, likelyhood and impact</p>',
            isSmooth: true,
            polyType: 'inland',
            'risk-level': 1,
            type: 'concernArea',
            'z-index': 3
          },
          type: 'Feature'
        }],
      type: 'FeatureCollection'
    }

    Code.expect(Result).to.be.equal(geoOutput)
  })
  lab.test('Check outlook riskLevels', async () => {
    const Result = await outlook.riskLevels

    const riskLevelsOutput = [0, 0, 0, 0, 1]

    Code.expect(Result).to.be.equal(riskLevelsOutput)
  })
  lab.test('Check outlook full', async () => {
    const Result = await outlook.full

    const fullOutput = '<p class="govuk-body">Local flooding from surface water and rivers is possible but not expected in places across much of the north of England on Friday due to widespread rain and heavy showers. Local flooding from rivers is possible, and flooding from surface water possible but not expected, across Wales and much of central and southern England on Friday.<br />Further local flooding from surface water and rivers is possible but not expected on Saturday and Sunday in parts of northern England due to heavy, thundery showers.<br />Local minor river and surface water flooding impacts are possible but not expected in parts of the north of England on Monday.</p><p class="govuk-body">Properties may flood and there may be travel disruption.</p>'

    Code.expect(Result).to.be.equal(fullOutput)
  })
  lab.test('testing this._hasOutlookConcern set to false', async () => {
    const outlookFakeData2 = {
      id: 1107,
      issued_at: '2019-08-08T09:30:00Z',
      pdf_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01107-2019-08-08_1030/fgs.pdf',
      detailed_csv_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01107-2019-08-08_1030/detailed.csv',
      area_of_concern_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01107-2019-08-08_1030/areaofconcern.jpg',
      flood_risk_trend:
      {
        day1: 'stable',
        day2: 'stable',
        day3: 'stable',
        day4: 'increasing',
        day5: 'increasing'
      },
      sources:
        [{ surface: 'The surface water flood risk is LOW.\n\nSignificant surface water flooding impacts are possible but not expected across many parts of England and Wales on Friday due to widespread rain and heavy showers. Significant surface water flooding impacts are possible but not expected from thunderstorms on Saturday and Sunday across parts of the north of England.\n\nMinor surface water flooding impacts are possible but not expected from heavy showers on Monday across parts of the north of England and Wales.\n' },
          { river: 'The river flood risk is LOW.\n\nSignificant river flooding impacts are possible but not expected across parts of the north Midlands and the north of England on Friday due to widespread rain and heavy showers. Significant river flooding impacts are possible but not expected from thunderstorms on Saturday and Sunday across parts of the north of England. Urban watercourses and small, fast responding river catchments are most at risk.\n\nMinor river flooding impacts are possible but not expected from heavy showers on Monday across parts of the north of England and Wales.\n\nThe ongoing situation at Toddbrook Reservoir is being managed by the relevant agencies to minimise the risk of flooding and has not been specifically shown on this product.' },
          { coastal: 'The coastal/tidal flood risk is VERY LOW for the next five days.' },
          { ground: 'The groundwater flood risk is VERY LOW for the next five days.' }],
      headline: 'Significant surface water and river flooding impacts are possible but not expected across parts of England and Wales on Friday, and across parts of the north of England on Saturday and Sunday. The overall flood risk is LOW.',
      amendments: '',
      future_forecast: '',
      last_modified_at: '2019-08-08T09:27:22Z',
      next_issue_due_at: '2019-08-09T09:30:00Z',
      png_thumbnails_with_days_url: 'https://s3-eu-west-1.amazonaws.com/assets.ffc-environment-agency.fgs.metoffice.gov.uk/fgs-statements/01107-2019-08-08_1030/FGSthumbnails-with-days.png',
      risk_areas:
        [{
          id: 1950,
          statement_id: 1105,
          updated_at: '2019-08-06T09:22:29Z',
          beyond_five_days: false,
          ordering: 2,
          risk_area_blocks: [
            {
              id: 2035,
              days: [5],
              risk_area_id: 1950,
              risk_levels: {},
              additional_information: 'Heavy thundery showers. Urban areas and small catchments most at risk.',
              polys:
                [
                  {
                    id: 2660,
                    coordinates:
                      [
                        [
                          [-4.174804687500001, 54.625522440842246],
                          [-3.146484643220902, 54.96247882239579],
                          [-2.531250268220902, 55.36412729483159],
                          [-2.3994143307209015, 55.65031856976615],
                          [-1.9599612057209017, 55.90980992336868],
                          [0.47141432762146, 53.83838539206968],
                          [0.21972656250000003, 53.32848623940286],
                          [-4.630237072706223, 53.13119286673744],
                          [-4.174804687500001, 54.625522440842246]
                        ]
                      ],
                    area: 8.42310580332646,
                    label_position: [-2.08465592935681, 54.1276207351252],
                    poly_type: 'inland',
                    risk_area_block_id: 2035,
                    counties: [
                      {
                        name: 'Lincolnshire'
                      }
                    ]
                  }
                ]
            }
          ]
        }
        ],
      aoc_maps:
        [{
          id: 1183,
          title: 'Specific Areas of Concern Map 3 - Sunday 11 August',
          ordering: 2,
          caption: '',
          ratio: [Array],
          statement_id: 1107,
          polys: [Array]
        }],
      public_forecast:
      {
        id: 1107,
        english_forecast: 'Local flooding from surface water and rivers is possible but not expected in places across much of the north of England on Friday due to widespread rain and heavy showers. Local flooding from rivers is possible, and flooding from surface water possible but not expected, across Wales and much of central and southern England on Friday.\nFurther local flooding from surface water and rivers is possible but not expected on Saturday and Sunday in parts of northern England due to heavy, thundery showers.\nLocal minor river and surface water flooding impacts are possible but not expected in parts of the north of England on Monday.\n\nProperties may flood and there may be travel disruption.',
        welsh_forecast: 'Mae llifogydd lleol o ddŵr wyneb ac afonydd yn bosibl ond nid yn ddisgwyliedig mewn mannau ar draws rhan fwyaf o ogledd Lloegr ar ddydd Gwener, o ganlyniad i law eang a chawodydd trwm. Mae llifogydd lleol o afonydd yn bosibl, a llifogydd o ddŵr wyneb yn bosibl ond heb eu disgwyl, ar draws Cymru a llawer o Ganolbarth a De Lloegr ar ddydd Gwener.\n\nMae\'n bosibl bydd llifogydd lleol pellach o ddŵr wyneb ac afonydd, ond heb eu disgwyl, ar ddydd Sadwrn a dydd Sul mewn rhannau o ogledd Lloegr oherwydd cawodydd trwm a stormydd. \n\nBydd siawns o effaith lifogydd o afonydd a dwr wyneb lleol mewn rhannau o Ogledd Lloegr ar Ddydd Llun ond nid yw hyn yn ddisgwyliedig. \n\nGall eiddo orlifo ac mae \'n bosibl y bydd tarfu ar deithio.\n',
        england_forecast: 'Service not available.',
        wales_forecast_english: 'Service not available.',
        wales_forecast_welsh: 'Service not available.',
        published_at: '2019-08-08T11:06:48Z'
      }
    }

    const outlook = new Outlook(outlookFakeData2)

    const Result = await outlook

    Code.expect(Result._hasOutlookConcern).to.be.equal(false)
  })
  lab.test('Check outlook days', async () => {
    const Result = await outlook.days

    Code.expect(Result[0].idx).to.be.equal(1)
    Code.expect(Result[0].level).to.be.equal(0)
  })
})
