import { terms } from '../terms.js'
import { colours } from '../colours.js'

const featureLayerDefaults = {
  type: 'FeatureService',
  groupLabel: terms.labels.mapFeatures,
  showInKey: true,
  visible: false,
}

const datasetMainRivers = {
  ...featureLayerDefaults,
  id: 'mainrivers',
  label: terms.labels.mainRivers,
  sourceLayer: 'Statutory_Main_River_Map',
  style: {
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        width: '3px',
        color: { outdoor: colours.mainRivers.default, dark: colours.mainRivers.dark },
      }
    },
    stroke: { outdoor: colours.mainRivers.default, dark: colours.mainRivers.dark },
    fill: 'transparent',
    symbolDescription: { outdoor: 'dark teal line', dark: 'white line' },
    keySymbolShape: 'line',
    strokeWidth: 3
  }
}

const datasetWaterStorageAreas = {
  ...featureLayerDefaults,
  id: 'waterstorage',
  label: terms.labels.waterStorage,
  sourceLayer: 'Flood_Storage_Areas',
  style: {
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-fill',
        style: 'diagonal-cross',
        color: { outdoor: colours.waterStorageAreas.default, dark: colours.waterStorageAreas.dark },
        outline: {
          color: { outdoor: colours.waterStorageAreas.default, dark: colours.waterStorageAreas.dark },
          width: 1
        }
      }
    },
    stroke: { outdoor: colours.waterStorageAreas.default, dark: colours.waterStorageAreas.dark },
    strokeWidth: 1,
    symbolDescription: { outdoor: 'dark teal cross-hatch', dark: 'white cross-hatch' },
    fillPattern: 'diagonal-cross-hatch',
    fillPatternForegroundColor: { outdoor: colours.waterStorageAreas.default, dark: colours.waterStorageAreas.dark },
    fillPatternBackgroundColor: 'transparent'
  }
}

const datasetFloodDefences = {
  ...featureLayerDefaults,
  id: 'flooddefence',
  label: terms.labels.floodDefence,
  sourceLayer: 'Defences',
  style: {
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        width: '3px',
        color: { outdoor: colours.floodDefences.default, dark: colours.floodDefences.dark },
      }
    },
    stroke: { outdoor: colours.floodDefences.default, dark: colours.floodDefences.dark },
    fill: 'transparent',
    symbolDescription: 'orange line',
    keySymbolShape: 'line',
    strokeWidth: 3
  }
}

export const featureLayers = (agolServiceUrl, layerNameSuffix) => [
  {
    ...datasetMainRivers,
    // NOTE: Main Rivers does not have the _NON_PRODUCTION ${layerNameSuffix}
    tiles: `${agolServiceUrl}/Statutory_Main_River_Map/FeatureServer`,
  },
  {
    ...datasetWaterStorageAreas,
    tiles: `${agolServiceUrl}/Flood_Storage_Areas${layerNameSuffix}/FeatureServer`,
  },
  {
    ...datasetFloodDefences,
    tiles: `${agolServiceUrl}/Defences${layerNameSuffix}/FeatureServer`,
  }
]
