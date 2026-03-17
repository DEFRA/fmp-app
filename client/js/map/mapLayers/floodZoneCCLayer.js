import { FloodMapLayer } from './floodMapLayer.js'
import { colours } from '../colours.js'
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer'
import GroupLayer from '@arcgis/core/layers/GroupLayer'

class FloodZoneCCLayer extends FloodMapLayer {
  constructor () {
    super({
      name: 'Flood_Zones_2_and_3_Rivers_and_Sea_CCP1',
      q: 'floodzones-climatechange',
      styleLayers: [
        ['Flood Zones 2 and 3 Rivers and Sea/Flood Zone 2/1', colours.floodZone2],
        ['Flood Zones 2 and 3 Rivers and Sea/Flood Zone 3/1', colours.floodZone3],
        ['Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zones plus climate change/1', colours.floodZoneCC]
      ],
      logStyles: false
    })
    this.floodZonesCCNodDataStandardLayerName = 'Flood Zones 2 and 3 Rivers and Sea CCP1/Unavailable/1'
    this.floodZonesCCNodDataDarkLayerName = 'Flood Zones 2 and 3 Rivers and Sea CCP1/Unavailable/2'
  }

  addToMap (map) {
    const floodZonesLayer = new VectorTileLayer({
      id: 'Flood_Zones_2_and_3_Rivers_and_Sea_CCP1',
      url: this.getVectorTileUrl('Flood_Zones_2_and_3_Rivers_and_Sea'),
      opacity: 1,
      visible: true
    })

    const floodZonesCCLayer = new VectorTileLayer({
      id: 'Flood_Zones_2_and_3_Rivers_and_Sea_CCP1',
      url: this.getVectorTileUrl('Flood_Zones_2_and_3_Rivers_and_Sea_CCP1'),
      opacity: 1,
      visible: true
    })

    const floodZoneCCGroupLayer = new GroupLayer({
      id: 'Flood_Zones_2_and_3_Rivers_and_Sea_CCP1',
      opacity: 1,
      visible: false
    })
    floodZoneCCGroupLayer.add(floodZonesCCLayer)
    floodZoneCCGroupLayer.add(floodZonesLayer)
    map.add(floodZoneCCGroupLayer)
    this.vectorTileLayer = floodZoneCCGroupLayer
    this.floodZonesCCLayer = floodZonesCCLayer
  }

  setFloodZoneCCStyleProperties () {
    const styleLayerName = 'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zones plus climate change/1'
    const layerPaintProperties = this.floodZonesCCLayer.getPaintProperties(styleLayerName)
    const paintProperties = colours.floodZoneCC
    if (layerPaintProperties) {
      const fillColour = paintProperties[this.isDark ? 1 : 0]
      layerPaintProperties['fill-color'] = fillColour
      this.floodZonesCCLayer.setPaintProperties(styleLayerName, layerPaintProperties)
    }
  }

  setStyleProperties () {
    // Set style properties of the standard flood zone layer using the parent class
    super.setStyleProperties()
    // Show and hide the floodZonesCCLayer "no data" standard/dark mode style layers as applicable
    this.floodZonesCCLayer.setStyleLayerVisibility(this.floodZonesCCNodDataStandardLayerName, this.isDark ? 'none' : 'visible')
    this.floodZonesCCLayer.setStyleLayerVisibility(this.floodZonesCCNodDataDarkLayerName, this.isDark ? 'visible' : 'none')
    // Now set the style for the FZ Climate Change Layer
    this.setFloodZoneCCStyleProperties()
  }

  get allLayers () {
    return [...super.allLayers, this.floodZonesCCLayer]
  }

  set visible (visible) {
    this.floodZonesCCLayer.visible = visible
    super.visible = visible
  }

  get visible () {
    return this.floodZonesCCLayer.visible && this.vectorTileLayer.visible
  }

  logStyleLayers () {
    console.log('\nFloodZones styles:')
    this.logStyleLayer(this.vectorTileLayer)
    console.log('\nFloodZonesCCLayer styles:')
    this.logStyleLayer(this.floodZonesCCLayer)
    this.logStyles = false
  }
}
export { FloodZoneCCLayer }
