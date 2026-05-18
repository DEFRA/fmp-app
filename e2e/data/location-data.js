const FLOOD_ZONE_1 = '1'
const FLOOD_ZONE_3 = '3'
const ZONE2_WITH_DEFENCE_CENTRE_EASTING = 479785
const ZONE2_WITH_DEFENCE_CENTRE_NORTHING = 472748

export const locationData = {
  zone1Postcode: 'YO18 7HN',
  zone2Postcode: 'WA1 2GE',
  zone2WithDefenceCentre: [ZONE2_WITH_DEFENCE_CENTRE_EASTING, ZONE2_WITH_DEFENCE_CENTRE_NORTHING],
  zone3Postcode: 'pickering',
  zone1PostcodeWithOptedOut: 'Enfield',
  zone3PostcodeWithOptedOut: 'Barnet',
  zone3WithDefencePostcode: 'HU1 1TH',
  nationalGridReference: 'SJ8632197947',
  easting: '509353',
  northing: '221346'
}

// Flood zone 3 polygon with surface water and Rivers flooding
export const areaData = {
  Yorkshire: {
    polygon: '[[470719.74,508440.3],[470756.89,508440.3],[470756.89,508403.15],[470719.74,508403.15],[470719.74,508440.3]]',
    floodZone: FLOOD_ZONE_3,
  },

  // Flood zone 1 polygon with Rivers flooding
  HertfordshireAndNorthLondon: {
    polygon: '[[532441.17,212478.2],[532478.32,212478.2],[532478.32,212441.05],[532441.17,212441.05],[532441.17,212478.2]]',
    floodZone: FLOOD_ZONE_1,
  },
}

// Polygon for Flood zone 1 with area greater than 1 hectare without surface water and rivers and sea flooding
export const floodZonedata = {
  FZ1_WithOut_SW_and_RandS_Area_GT_1Hectare: '[[435903.51,113976.55],[436019.3,113985.36],[436020.85,113929.5],[435993.75,113874.79],[435939.21,113870.18],[435903.51,113976.55]]',

  // Polygon for Flood zone 1 with area less than 1 hectare without surface water and rivers and sea flooding
  FZ1_WithOut_SW_and_RandS_Area_LT_1Hectare: '[[435941.99,113922.39],[435980.21,113923.35],[435994.06,113875.1],[435937.69,113877.96],[435941.99,113922.39]]',

  // Polygon for Flood zone 1 with area greater than 1 hectare with only surface water flooding
  FZ1_With_SW_and_Area_GT_1Hectare: '[[435659.74,113895.79],[435894.42,113895.79],[435894.42,113661.11],[435659.74,113661.11],[435659.74,113895.79]]',

  // Polygon for Flood zone 1 with area less than 1 hectare with only surface water flooding
  FZ1_With_SW_and_Area_LT_1Hectare: '[[435729.91,113895.2],[435894.42,113895.79],[435892.95,113837.71],[435729.91,113839.17],[435729.91,113895.2]]',

  // Polygon for Flood zone 1 with no flooding
  FZ1_With_No_Flooding: '[[435562,114890],[435562,114891],[435563,114890],[435562,114890]]',

  // Polygon for Flood zone 1 with sea and surface water flooding
  FZ1_With_SW_and_S: '[[435502.78,114950.22],[435622.22,114950.22],[435622.22,114830.78],[435502.78,114830.78],[435502.78,114950.22]]',

  // Polygon for Flood zone 1 with rivers and surface water flooding
  FZ1_With_SW_and_R: '[[450010.01,207277.26],[450053.16,207251.71],[450027.88,207243.48],[450002.23,207235.93],[450010.01,207277.26]]',

  // Polygon for Flood zone 2 with only rivers flooding
  FZ2_With_R: '[[435967.95,114037.32],[436036.62,114037.32],[436036.62,113968.65],[435967.95,113968.65],[435967.95,114037.32]]',

  // Polygon for Flood zone 2 with sea and surface water flooding
  FZ2_With_SW_and_S: '[[511645.18,433200.8],[511726.63,433153.58],[511763.06,433038.42],[511645.18,433200.8]]]',

  // Polygon for Flood zone 2 with rivers and surface water flooding
  FZ2_With_SW_and_R: '[[435892.17,114089.28],[436013.1,114089.28],[436013.1,113968.35],[435892.17,113968.35],[435892.17,114089.28]]',

  // Polygon for Flood zone 2 with sea, surface water and rivers flooding
  FZ2_With_SW_and_S_and_R: '[[621177.41,230258.41],[621212.94,230262.29],[621176.64,230244.11],[621177.41,230258.41]]',

  // Polygon for Flood zone 3 with only rivers flooding
  FZ3_With_R: '[[431342.07,119686.44],[431408.95,119681.74],[431408.95,119622.02],[431349.23,119622.02],[431342.07,119686.44]]',

  // Polygon for Flood zone 3 with rivers and surface water flooding
  FZ3_With_SW_and_R: '[[435573.79,114051.14],[435642.46,114051.14],[435642.46,113982.47],[435573.79,113982.47],[435573.79,114051.14]]',

  // Polygon for Flood zone 3 with rivers, sea and surface water flooding
  FZ3_With_SW_and_S: '[[440068.48,557500.73],[440231.71,557448.26],[440145.26,557288.92],[440068.48,557500.73]]',

  // Polygon 300 hectares in size for Flood zone 3 with rivers,sea and surface water flooding
  polygon300: '[[536202.02,275604.53],[537934.07,275604.53],[537934.07,273872.48],[536202.02,273872.48],[536202.02,275604.53]]',

  // Polygon 300.01 hectares in size for Flood zone 3 with rivers and surface water flooding
  polygon300_01: '[[569264.26,235805.29],[570996.34,235805.29],[570996.34,234073.21],[569264.26,234073.21],[569264.26,235805.29]]',

  // Polygon which is not under an area teams jurisdiction
  area_Team_NoJurisdiction: '[[497260.09,423202.36], [497737.82,423202.36], [497737.82,422724.63], [497260.09,422724.63], [497260.09,423202.36]]',

  // Polygon which is on the England-Wales border
  England_Wales_Border: '[[322634.00346,299374.85148],[323341.83397,299308.86728],[323215.86414,298918.96064],[322520.03075,299062.92617],[322634.00346,299374.85148]]',

  // Polygon which is on the England-Scotland border
  England_Scotland_Border: '[[397018.13781,657457.86591],[397992.82671,656695.2514],[397691.5313,656685.04864],[396390.77776,657140.55168],[397018.13781,657457.86591]]'
}
