// When vtLayers.js and mapLayers/ is gone, tidy this up and make all the colours consistently have dark/outdoor
// Also - replace the hard coded colours in datasets/floodZones.js when this is done
const nonFloodZoneLight = '#2b8cbe'
const nonFloodZoneDark = '#7fcdbb'
const floodZone2Light = '#1d70b8'
const floodZone2Dark = '#41ab5d'
const floodZone3Light = '#003078'
const floodZone3Dark = '#e5f5e0'
const black = '#000000'
const white = '#ffffff'
const darkTeal = '#12393d'
const floodDefences = '#f47738'
const floodZoneCCLight = '#F4A582'
const floodZoneCCDark = '#BF3D4A'
const depthOver2300 = { default: '#7f2704', dark: '#238b45' }
const depthOver1200 = { default: '#a63603', dark: '#41ab5d' }
const depthOver900 = { default: '#d94801', dark: '#74c476' }
const depthOver600 = { default: '#f16913', dark: '#a1d99b' }
const depthOver300 = { default: '#fd8d3c', dark: '#c7e9c0' }
const depthOver150 = { default: '#fdae6b', dark: '#e5f5e0' }
const depthOverZero = { default: '#fdd0a2', dark: '#f7fcf5' }

// light tones > 2300 to < 150
const nonFloodZoneDepthBandsLight = [depthOver2300.default, depthOver1200.default, depthOver900.default, depthOver600.default, depthOver300.default, depthOver150.default, depthOverZero.default]
// GREENS dark tones > 2300 to < 150
const nonFloodZoneDepthBandsDark = [depthOver2300.dark, depthOver1200.dark, depthOver900.dark, depthOver600.dark, depthOver300.dark, depthOver150.dark, depthOverZero.dark]

export const colours = { // [default, dark]
  nonFloodZoneLight,
  nonFloodZoneDark,
  nonFloodZone: [nonFloodZoneLight, nonFloodZoneDark],
  depthOver2300,
  depthOver1200,
  depthOver900,
  depthOver600,
  depthOver300,
  depthOver150,
  depthOverZero,
  nonFloodZoneDepthBands: [ // can be deleted once vtLayers.js is gone
    [nonFloodZoneDepthBandsLight[0], nonFloodZoneDepthBandsDark[0]],
    [nonFloodZoneDepthBandsLight[1], nonFloodZoneDepthBandsDark[1]],
    [nonFloodZoneDepthBandsLight[2], nonFloodZoneDepthBandsDark[2]],
    [nonFloodZoneDepthBandsLight[3], nonFloodZoneDepthBandsDark[3]],
    [nonFloodZoneDepthBandsLight[4], nonFloodZoneDepthBandsDark[4]],
    [nonFloodZoneDepthBandsLight[5], nonFloodZoneDepthBandsDark[5]],
    [nonFloodZoneDepthBandsLight[6], nonFloodZoneDepthBandsDark[6]]
  ],
  floodZone2: [floodZone2Light, floodZone2Dark], // can be deleted once vtLayers.js is gone
  floodZone3: [floodZone3Light, floodZone3Dark], // can be deleted once vtLayers.js is gone
  floodZoneClimateChange: [floodZoneCCLight, floodZoneCCDark], // can be deleted once vtLayers.js is gone
  floodZoneClimateChangeNoData: [black, white], // can be deleted once vtLayers.js is gone
  waterStorageAreas: { default: darkTeal, dark: white },
  mainRivers: { default: darkTeal, dark: white },
  floodDefences: { default: floodDefences, dark: floodDefences },
  floodExtents: [nonFloodZoneLight, nonFloodZoneDark] // can be deleted once vtLayers.js is gone
}

export const getKeyItemFill = ([light, dark]) => (`default: ${light}, dark: ${dark}`)
