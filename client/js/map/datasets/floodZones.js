import { terms } from '../terms.js'
const floodZonesDefaults = {
  groupLabel: terms.labels.datasets,
  esriGroupId: 'floodzones-group',
  showInKey: true,
  visibleWhen: { menu: { dataset: ['floodzones'] } }
}

// These are the values for flood zone 2 present day. The other flood zones will override the fz value as appropriate.
const infoPanelData = {
  tf: 'pd',
  ds: 'fz',
  fz: 'FZ2',
  fs: '' // need to get flood source from the data
}

const datasetFloodZonesCC = {
  ...floodZonesDefaults,
  id: 'floodzonescc',
  label: terms.labels.floodZones,
  groupLabel: terms.labels.floodZones,
  sourceLayer: 'Flood Zones 2 and 3 Rivers and Sea CCP1',
  sublayers: [
    {
      id: 'climate-change',
      label: `${terms.labels.climateChange} (${terms.labels.floodZoneClimateChange})`,
      esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zones plus climate change/1',
      infoPanelData: { ...infoPanelData, tf: 'cc', fz: 'FZCC' },
      showInKey: true,
      visibleWhen: {
        menu: {
          dataset: ['floodzones'], timeframe: ['climatechange']
        }
      },
      style: {
        fill: { outdoor: '#F4A582', dark: '#BF3D4A' },
        stroke: 'none',
        symbolDescription: { outdoor: 'light salmon fill', dark: 'dark red fill' },
      },
    },
    {
      id: 'data-unavailable',
      label: terms.labels.noData,
      showInKey: true,
      visibleWhen: {
        menu: {
          dataset: ['floodzones'], timeframe: ['climatechange']
        }
      },
      style: { // This is used just for the key - so that it renders the pattern correctly.
        fillPattern: 'dot',
        fillPatternForegroundColor: { outdoor: '#000000', dark: '#ffffff' },
        stroke: { outdoor: '#000000', dark: '#FFFFFF' },
        symbolDescription: { outdoor: 'black dotted fill', dark: 'white dotted fill' },
      }
    },
    {
      id: 'data-unavailable-outline',
      showInKey: false,
      visibleWhen: {
        menu: { dataset: ['floodzones'], timeframe: ['climatechange'] }
      },
      style: {
        stroke: { outdoor: '#000000', dark: '#FFFFFF' },
      },
      infoPanelData: { ...infoPanelData, tf: 'cc', fz: 'FZNODATA' },
      esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Unavailable/0'
    },
    {
      id: 'data-unavailable-light',
      visibleWhen: {
        mapStyleId: ['outdoor', 'black-and-white'],
        menu: { dataset: ['floodzones'], timeframe: ['climatechange'] }
      },
      infoPanelData: { ...infoPanelData, tf: 'cc', fz: 'FZNODATA' },
      esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Unavailable/1',
      esriUseServerStyle: true,
      showInKey: false,
    },
    {
      id: 'data-unavailable-dark',
      visibleWhen: {
        menu: { dataset: ['floodzones'], timeframe: ['climatechange'] },
        mapStyleId: ['dark']
      },
      infoPanelData: { ...infoPanelData, tf: 'cc', fz: 'FZNODATA' },
      esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Unavailable/2',
      esriUseServerStyle: true,
      showInKey: false,
    }
  ]
}

const datasetFloodZones = {
  ...floodZonesDefaults,
  id: 'floodzones',
  label: terms.labels.floodZones,
  groupLabel: terms.labels.floodZones,
  sourceLayer: 'Flood Zones 2 and 3 Rivers and Sea',
  sublayers: [
    {
      id: 'flood-zone-2',
      label: 'Flood Zone 2',
      infoPanelData,
      esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 2/1',
      style: {
        fill: { outdoor: '#1d70b8', dark: '#7fcdbb' },
        stroke: 'none',
        symbolDescription: { outdoor: 'blue fill', dark: 'light teal fill' },
      },
    },
    {
      id: 'flood-zone-3',
      label: 'Flood Zone 3',
      infoPanelData: { ...infoPanelData, fz: 'FZ3' },
      esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 3/1',
      style: {
        fill: { outdoor: '#003078', dark: '#e5f5e0' },
        stroke: 'none',
        symbolDescription: { outdoor: 'dark blue fill', dark: 'light green fill' },
      },
    }
  ]
}

export const floodZonesDatasets = ({ agolVectorTileUrl, layerNameSuffix }) => [
  {
    ...datasetFloodZonesCC,
    tiles: `${agolVectorTileUrl}/Flood_Zones_2_and_3_Rivers_and_Sea_CCP1${layerNameSuffix}/VectorTileServer`,
  }, {
    ...datasetFloodZones,
    tiles: `${agolVectorTileUrl}/Flood_Zones_2_and_3_Rivers_and_Sea${layerNameSuffix}/VectorTileServer`,
  }
]
