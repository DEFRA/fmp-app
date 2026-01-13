const nonFloodZoneLight = '#2b8cbe'
const nonFloodZoneDark = '#7fcdbb'
const floodZone2Light = '#1d70b8'
const floodZone2Dark = '#41ab5d'
const floodZone3Light = '#003078'
const floodZone3Dark = '#e5f5e0'
const white = '#ffffff'
// light tones > 2300 to < 150
const nonFloodZoneDepthBandsLight = ['#7f2704', '#a63603', '#d94801', '#f16913', '#fd8d3c', '#fdae6b', '#fdd0a2']
// GREENS dark tones > 2300 to < 150
const nonFloodZoneDepthBandsDark = ['#238b45', '#41ab5d', '#74c476', '#a1d99b', '#c7e9c0', '#e5f5e0', '#f7fcf5']

let colourIndex = 0 // Avoid a magic number sonar issue
const colours = { // [default, dark]
  nonFloodZone: [nonFloodZoneLight, nonFloodZoneDark],
  nonFloodZoneDepthBands: [
    [nonFloodZoneDepthBandsLight[colourIndex], nonFloodZoneDepthBandsDark[colourIndex++]],
    [nonFloodZoneDepthBandsLight[colourIndex], nonFloodZoneDepthBandsDark[colourIndex++]],
    [nonFloodZoneDepthBandsLight[colourIndex], nonFloodZoneDepthBandsDark[colourIndex++]],
    [nonFloodZoneDepthBandsLight[colourIndex], nonFloodZoneDepthBandsDark[colourIndex++]],
    [nonFloodZoneDepthBandsLight[colourIndex], nonFloodZoneDepthBandsDark[colourIndex++]],
    [nonFloodZoneDepthBandsLight[colourIndex], nonFloodZoneDepthBandsDark[colourIndex++]],
    [nonFloodZoneDepthBandsLight[colourIndex], nonFloodZoneDepthBandsDark[colourIndex++]]
  ],
  floodZone2: [floodZone2Light, floodZone2Dark],
  floodZone3: [floodZone3Light, floodZone3Dark],
  floodZoneCC: ['#F4A582', '#BF3D4A'],
  floodZoneNoData: ['#000000', '#FFFFFF'],
  waterStorageAreas: ['#12393d', white],
  mainRivers: ['#12393d', white],
  floodDefences: ['#f47738', '#f47738'],
  floodExtents: [nonFloodZoneLight, nonFloodZoneDark]
}

const getKeyItemFill = ([light, dark]) => (`default: ${light}, dark: ${dark}`)

const LIGHT_INDEX = 0
const DARK_INDEX = 1
module.exports = { colours, getKeyItemFill, LIGHT_INDEX, DARK_INDEX }
