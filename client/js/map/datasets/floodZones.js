import { terms } from '../terms.js'

const visibleWhenFloodZones = { menu: { dataset: ['floodzones'] } }
const visibleWhenClimateChange = { menu: { dataset: ['floodzones'], timeframe: ['climatechange'] } }
const visibleWhenPresentDay = { menu: { dataset: ['floodzones'], timeframe: ['presentday'] } }

const floodZonesDefaults = {
  groupLabel: terms.labels.datasets,
  esriGroupId: 'floodzones-group',
  showInKey: false,
  visibleWhen: visibleWhenFloodZones
}

// These are the values for flood zone 2 present day. The other flood zones will override the fz value as appropriate.
const infoPanelData = {
  tf: 'pd',
  ds: 'fz',
  fz: 'FZ2',
  fs: '' // need to get flood source from the data
}

const ccSublayer = {
  id: 'climate-change',
  label: `${terms.labels.climateChange} (${terms.labels.floodZoneClimateChange})`,
  esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zones plus climate change/1',
  infoPanelData: { ...infoPanelData, tf: 'cc', fz: 'FZCC' },
  visibleWhen: visibleWhenClimateChange,
  style: {
    fill: { outdoor: '#F4A582', dark: '#BF3D4A' },
    stroke: { outdoor: '#F4A582', dark: '#BF3D4A' },
    symbolDescription: { outdoor: 'light salmon fill', dark: 'dark red fill' },
  },
}

const noDataSublayer = {
  id: 'data-unavailable',
  label: terms.labels.noData,
  visibleWhen: visibleWhenClimateChange,
  style: { // This is used just for the key - so that it renders the pattern correctly.
    fillPattern: 'dot',
    fillPatternForegroundColor: { outdoor: '#000000', dark: '#ffffff' },
    stroke: { outdoor: '#000000', dark: '#FFFFFF' },
    symbolDescription: { outdoor: 'black dotted fill', dark: 'white dotted fill' },
  }
}

const fz2Sublayer = {
  id: 'flood-zone-2',
  label: terms.labels.floodZone2,
  infoPanelData,
  esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 2/1',
  style: {
    fill: { outdoor: '#1d70b8', dark: '#7fcdbb' },
    stroke: { outdoor: '#1d70b8', dark: '#7fcdbb' },
    symbolDescription: { outdoor: 'blue fill', dark: 'light teal fill' },
  },
}
const fz3Sublayer =
{
  id: 'flood-zone-3',
  label: terms.labels.floodZone3,
  infoPanelData: { ...infoPanelData, fz: 'FZ3' },
  esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 3/1',
  style: {
    fill: { outdoor: '#003078', dark: '#e5f5e0' },
    stroke: { outdoor: '#003078', dark: '#e5f5e0' },
    symbolDescription: { outdoor: 'dark blue fill', dark: 'light green fill' },
  },
}

const datasetFloodZonesCC = {
  ...floodZonesDefaults,
  id: 'floodzonescc',
  label: terms.labels.floodZones,
  groupLabel: terms.labels.floodZones,
  sourceLayer: 'Flood Zones 2 and 3 Rivers and Sea CCP1',
  sublayers: [
    ccSublayer,
    noDataSublayer,
    {
      id: 'data-unavailable-outline',
      visibleWhen: visibleWhenClimateChange,
      style: {
        stroke: { outdoor: '#000000', dark: '#FFFFFF' },
      },
      infoPanelData: { ...infoPanelData, tf: 'cc', fz: 'FZNODATA' },
      esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Unavailable/0'
    },
    {
      id: 'data-unavailable-light',
      visibleWhen: { ...visibleWhenClimateChange, mapStyleId: ['outdoor', 'black-and-white'] },
      infoPanelData: { ...infoPanelData, tf: 'cc', fz: 'FZNODATA' },
      esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Unavailable/1',
      esriUseServerStyle: true,
    },
    {
      id: 'data-unavailable-dark',
      visibleWhen: { ...visibleWhenClimateChange, mapStyleId: ['dark'] },
      infoPanelData: { ...infoPanelData, tf: 'cc', fz: 'FZNODATA' },
      esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Unavailable/2',
      esriUseServerStyle: true,
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
    fz2Sublayer,
    fz3Sublayer,
  ]
}

const keyOverrides = {
  esriStyleLayerId: null, showInKey: true
}
const datasetKeys = {
  ...floodZonesDefaults,
  id: 'floodzones-key',
  groupLabel: terms.labels.floodZones,
  infoPanelData: null,
  showInKey: true,
  sublayers: [
    { ...fz2Sublayer, id: fz2Sublayer.id + '-key', ...keyOverrides, visibleWhen: visibleWhenPresentDay },
    { ...fz3Sublayer, id: fz3Sublayer.id + '-key', ...keyOverrides, visibleWhen: visibleWhenPresentDay },
    { ...fz2Sublayer, id: fz2Sublayer.id + '-cc-key', ...keyOverrides, visibleWhen: visibleWhenClimateChange, label: terms.labels.floodZone2PresentDay },
    { ...fz3Sublayer, id: fz3Sublayer.id + '-cc-key', ...keyOverrides, visibleWhen: visibleWhenClimateChange, label: terms.labels.floodZone3PresentDay },
    { ...ccSublayer, id: ccSublayer.id + '-key', ...keyOverrides },
    { ...noDataSublayer, id: noDataSublayer.id + '-key', ...keyOverrides },
  ]
}

export const floodZonesDatasets = ({ agolVectorTileUrl, layerNameSuffix }) => [
  {
    ...datasetFloodZonesCC,
    tiles: `${agolVectorTileUrl}/Flood_Zones_2_and_3_Rivers_and_Sea_CCP1${layerNameSuffix}/VectorTileServer`,
  }, {
    ...datasetFloodZones,
    tiles: `${agolVectorTileUrl}/Flood_Zones_2_and_3_Rivers_and_Sea${layerNameSuffix}/VectorTileServer`,
  },
  datasetKeys
]
