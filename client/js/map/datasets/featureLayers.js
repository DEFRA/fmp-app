import { terms } from '../terms.js'
import { colours } from '../colours.js'

export const featureLayers = (agolServiceUrl, layerNameSuffix) => {
  const datasetMainRivers = {
    id: 'mainrivers',
    label: terms.labels.mainRivers,
    groupLabel: terms.labels.mapFeatures,
    type: 'FeatureService',
    // NOTE: Main Rivers does not have the _NON_PRODUCTION ${layerNameSuffix}
    tiles: `${agolServiceUrl}/Statutory_Main_River_Map/FeatureServer`,
    showInKey: true,
    sourceLayer: 'Statutory_Main_River_Map',
    visible: false,
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
      strokeWidth: 3
    }
  }

  const datasetWaterStorageAreas = {
    id: 'waterstorage',
    label: terms.labels.waterStorage,
    groupLabel: terms.labels.mapFeatures,
    type: 'FeatureService',
    tiles: `${agolServiceUrl}/Flood_Storage_Areas${layerNameSuffix}/FeatureServer`,
    showInKey: true,
    sourceLayer: 'Flood_Storage_Areas',
    visible: false,
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
      fillPattern: 'diagonal-cross-hatch',
      fillPatternForegroundColor: { outdoor: colours.waterStorageAreas.default, dark: colours.waterStorageAreas.dark },
      fillPatternBackgroundColor: 'transparent'
    }
  }

  const datasetFloodDefences = {
    id: 'flooddefence',
    label: terms.labels.floodDefence,
    groupLabel: terms.labels.mapFeatures,
    type: 'FeatureService',
    tiles: `${agolServiceUrl}/Defences${layerNameSuffix}/FeatureServer`,
    showInKey: true,
    sourceLayer: 'Defences',
    visible: false,
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
      strokeWidth: 3
    }
  }
  return [datasetMainRivers, datasetWaterStorageAreas, datasetFloodDefences]
}
