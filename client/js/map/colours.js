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

// Key Colours
export const COLOURS = {
  floodExtents: { default: nonFloodZoneLight, dark: nonFloodZoneDark },

  depthOver2300: { default: '#7f2704', dark: '#238b45' },
  depth2300: { default: '#a63603', dark: '#41ab5d' },
  depth1200: { default: '#d94801', dark: '#74c476' },
  depth900: { default: '#f16913', dark: '#a1d99b' },
  depth600: { default: '#fd8d3c', dark: '#c7e9c0' },
  depth300: { default: '#fdae6b', dark: '#e5f5e0' },
  depth150: { default: '#fdd0a2', dark: '#f7fcf5' },

  floodZone3: { default: '#003078', dark: '#e5f5e0' },
  floodZone2: { default: '#1d70b8', dark: '#41ab5d' },
  floodZoneClimateChange: { default: floodZoneCCLight, dark: floodZoneCCDark },
  floodZoneClimateChangeNoData: { default: darkTeal, dark: white },

  floodDefences: { default: floodDefences, dark: floodDefences },
  waterStorageAreas: { default: darkTeal, dark: white },
  mainRivers: { default: darkTeal, dark: white }
}

// light tones > 2300 to < 150
const nonFloodZoneDepthBandsLight = [COLOURS.depthOver2300.default, COLOURS.depth2300.default, COLOURS.depth1200.default, COLOURS.depth900.default, COLOURS.depth600.default, COLOURS.depth300.default, COLOURS.depth150.default]
// GREENS dark tones > 2300 to < 150
const nonFloodZoneDepthBandsDark = [COLOURS.depthOver2300.dark, COLOURS.depth2300.dark, COLOURS.depth1200.dark, COLOURS.depth900.dark, COLOURS.depth600.dark, COLOURS.depth300.dark, COLOURS.depth150.dark]

export const colours = { // [default, dark]
  nonFloodZoneLight,
  nonFloodZoneDark,
  nonFloodZone: [nonFloodZoneLight, nonFloodZoneDark],
  depthOver2300: { default: '#7f2704', dark: '#238b45' },
  depth2300: { default: '#a63603', dark: '#41ab5d' },
  depth1200: { default: '#d94801', dark: '#74c476' },
  depth900: { default: '#f16913', dark: '#a1d99b' },
  depth600: { default: '#fd8d3c', dark: '#c7e9c0' },
  depth300: { default: '#fdae6b', dark: '#e5f5e0' },
  depth150: { default: '#fdd0a2', dark: '#f7fcf5' },
  nonFloodZoneDepthBands: [
    [nonFloodZoneDepthBandsLight[0], nonFloodZoneDepthBandsDark[0]],
    [nonFloodZoneDepthBandsLight[1], nonFloodZoneDepthBandsDark[1]],
    [nonFloodZoneDepthBandsLight[2], nonFloodZoneDepthBandsDark[2]],
    [nonFloodZoneDepthBandsLight[3], nonFloodZoneDepthBandsDark[3]],
    [nonFloodZoneDepthBandsLight[4], nonFloodZoneDepthBandsDark[4]],
    [nonFloodZoneDepthBandsLight[5], nonFloodZoneDepthBandsDark[5]],
    [nonFloodZoneDepthBandsLight[6], nonFloodZoneDepthBandsDark[6]]
  ],
  floodZone2: [floodZone2Light, floodZone2Dark],
  floodZone3: [floodZone3Light, floodZone3Dark],
  floodZoneClimateChange: [floodZoneCCLight, floodZoneCCDark],
  floodZoneClimateChangeNoData: [black, white],
  waterStorageAreas: { default: darkTeal, dark: white },
  mainRivers: { default: darkTeal, dark: white },
  floodDefences: { default: floodDefences, dark: floodDefences },
  floodExtents: [nonFloodZoneLight, nonFloodZoneDark]
}

export const getKeyItemFill = ([light, dark]) => (`default: ${light}, dark: ${dark}`)
