export const locationData = {
  zone1Postcode: 'YO18 7HN',
  zone2Postcode: 'WA1 2GE',
  zone2WithDefenceCentre: [479785, 472748],
  zone3Postcode: 'pickering',
  zone1PostcodeWithOptedOut: 'Enfield',
  zone3PostcodeWithOptedOut: 'Barnet',
  zone3WithDefencePostcode: 'HU1 1TH',
  nationalGridReference: 'SJ8632197947',
  easting: '509353',
  northing: '221346'
}

export const areaData = {
  Yorkshire: {
    polygon: '[[470689.97,508442.8],[470727.12,508442.8],[470727.12,508405.65],[470689.97,508405.65],[470689.97,508442.8]]',
    floodZone: '3',
  },

  HertfordshireAndNorthLondon: {
    polygon: '[[532441.17,212478.2],[532478.32,212478.2],[532478.32,212441.05],[532441.17,212441.05],[532441.17,212478.2]]',
    floodZone: '1',
  },
}

// Polygon for Flood zone 1 with area Greater than 1 hectare without surface water and Rivers and sea flooding
export const floodZonedata = {
  FZ1_WithOut_SW_and_RandS_Area_GT_1Hectare: '[[435903.51,113976.55],[436019.3,113985.36],[436020.85,113929.5],[435993.75,113874.79],[435939.21,113870.18],[435903.51,113976.55]]',

  // Polygon for Flood zone 1 with area less than 1 hectare without surface water and Rivers and sea flooding
  FZ1_WithOut_SW_and_RandS_Area_LT_1Hectare: '[[435941.99,113922.39],[435980.21,113923.35],[435994.06,113875.1],[435937.69,113877.96],[435941.99,113922.39]]',

  // Polygon for Flood zone 1 with area Greater than 1 hectare with only surface water
  FZ1_With_SW_and_Area_GT_1Hectare: '[[435659.74,113895.79],[435894.42,113895.79],[435894.42,113661.11],[435659.74,113661.11],[435659.74,113895.79]]',

  // Polygon for Flood zone 1 with area less than 1 hectare with only surface water
  FZ1_With_SW_and_Area_LT_1Hectare: '[[435729.91,113895.2],[435894.42,113895.79],[435892.95,113837.71],[435729.91,113839.17],[435729.91,113895.2]]',

  // Polygon for Flood zone 1 with only Rivers and sea
  FZ1_With_RandS: '[[435562,114890],[435562,114891],[435563,114890],[435562,114890]]',

  // Polygon for Flood zone 1 with Rivers and sea  And Surface water
  FZ1_With_SW_and_RandS: '[[435502.78,114950.22],[435622.22,114950.22],[435622.22,114830.78],[435502.78,114830.78],[435502.78,114950.22]]',

  // Polygon for Flood zone 2 with only Rivers and sea  -->Updated
  FZ2_With_RandS: '[[435967.95,114037.32],[436036.62,114037.32],[436036.62,113968.65],[435967.95,113968.65],[435967.95,114037.32]]',

  // Polygon for Flood zone 2 with Rivers and sea  And Surface water --> Updated
  FZ2_With_SW_and_RandS: '[[435892.17,114089.28],[436013.1,114089.28],[436013.1,113968.35],[435892.17,113968.35],[435892.17,114089.28]]',

  // Polygon for Flood zone 3 with only Rivers and sea  -->need Updated
  FZ3_With_RandS: '[[431342.07,119686.44],[431408.95,119681.74],[431408.95,119622.02],[431349.23,119622.02],[431342.07,119686.44]]',

  // Polygon for Flood zone 3 with Rivers and sea  And Surface water --> Updated
  FZ3_With_SW_and_RandS: '[[435573.79,114051.14],[435642.46,114051.14],[435642.46,113982.47],[435573.79,113982.47],[435573.79,114051.14]]',

  // Polygon 300 hectares in size
  polygon300: '[[536202.02,275604.53],[537934.07,275604.53],[537934.07,273872.48],[536202.02,273872.48],[536202.02,275604.53]]',

  // Polygon 300.01 hectares in size
  polygon300_01: '[[569264.26,235805.29],[570996.34,235805.29],[570996.34,234073.21],[569264.26,234073.21],[569264.26,235805.29]]'
}
