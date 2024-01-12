// FZ2 is equivalent to 0.1% AEP (i in 1000)
// FZ3 is equivalent to 1% AEP (i in 100)
// FZ3b (not specified by name) is equivalent to 3.3% AEP (i in 30)

class MapController {
  constructor (map) {
    this.map = map
    this._baseMap = 'Outdoor_27700' // can be 'Outdoor_27700', 'Leisure_27700', 'Road_27700', 'Light_27700'
    this._climateChangeScenario = 'present-day' // can be present-day, ccp1, ccp2
    this._visibleLayers = {}
    this.addBaseMapRadioClickEvents('base-map')
    this.initialiseAvailableLayers()
  }

  initialiseAvailableLayers () {
    this._riversAndSeaLayers = {}
    this._surfaceWaterLayers = {}
    this._otherLayers = {}
    this._allLayers = {}
    this._availableLayers = [
      ['fmp:defences', 'Flood defences', 'other'],
      ['fmp:main_rivers_10k', 'Main rivers', 'other'],
      ['fmp:flood_storage_areas', 'Flood storage areas', 'other'],
      // Rivers and Sea - no depth
      ['fmp:flood_zone_2_3_rivers_and_sea', 'Rivers and sea - flood zones 2 and 3', 'RS'],
      ['fmp:flood_zone_2_3_rivers_and_sea_ccp1', 'Rivers and sea - flood zones 2 and 3', 'RS'],
      ['fmp:flood_zone_2_3_rivers_and_sea_ccp2', 'Rivers and sea - flood zones 2 and 3', 'RS'],
      // Rivers and Sea defended - no depth
      ['fmp:rivers_1in30_sea_1in30_defended', 'Rivers and sea - 3.3% AEP - defended', 'RS'],
      ['fmp:rivers_1in30_sea_1in30_defended_ccp1', 'Rivers and sea - 3.3% AEP - defended', 'RS'],
      ['fmp:rivers_1in30_sea_1in30_defended_ccp2', 'Rivers and sea - 3.3% AEP - defended', 'RS'],
      // Rivers and Sea defended - depth - 3.3% AEP
      ['fmp:rivers_1in30_sea_1in30_defended_depth', 'Rivers and sea - 3.3% AEP - defended depth', 'RS'],
      ['fmp:rivers_1in30_sea_1in30_defended_depth_ccp1', 'Rivers and sea - 3.3% AEP - defended depth', 'RS'],
      ['fmp:rivers_1in30_sea_1in30_defended_depth_ccp2', 'Rivers and sea - 3.3% AEP - defended depth', 'RS'],
      // Rivers and Sea defended - depth - 1% AEP
      ['fmp:rivers_1in100_sea_1in200_defended_depth', 'Rivers - 1%, sea 0.5% AEP - defended depth', 'RS'],
      ['fmp:rivers_1in100_sea_1in200_defended_depth_ccp1', 'Rivers - 1%, sea 0.5% AEP - defended depth', 'RS'],
      ['fmp:rivers_1in100_sea_1in200_defended_depth_ccp2', 'Rivers - 1%, sea 0.5% AEP - defended depth', 'RS'],
      // Rivers and Sea defended - depth - 0.1% AEP
      ['fmp:rivers_1in1000_sea_1in1000_defended_depth', 'Rivers and sea - 0.1% AEP - defended depth', 'RS'],
      ['fmp:rivers_1in1000_sea_1in1000_defended_depth_ccp1', 'Rivers and sea - 0.1% AEP - defended depth', 'RS'],
      ['fmp:rivers_1in1000_sea_1in1000_defended_depth_ccp2', 'Rivers and sea - 0.1% AEP - defended depth', 'RS'],
      // Rivers and Sea undefended - depth 1% AEP
      ['fmp:rivers_1in100_sea_1in200_undefended_depth', 'Rivers - 1%, sea 0.5% AEP - undefended depth', 'RS'],
      ['fmp:rivers_1in100_sea_1in200_undefended_depth_ccp1', 'Rivers - 1%, sea 0.5% AEP - undefended depth', 'RS'],
      ['fmp:rivers_1in100_sea_1in200_undefended_depth_ccp2', 'Rivers - 1%, sea 0.5% AEP - undefended depth', 'RS'],
      // Rivers and Sea undefended - depth 0.1% AEP
      ['fmp:rivers_1in1000_sea_1in1000_undefended_depth', 'Rivers and sea - 0.1% AEP - undefended depth', 'RS'],
      ['fmp:rivers_1in1000_sea_1in1000_undefended_depth_ccp1', 'Rivers and sea - 0.1% AEP - undefended depth', 'RS'],
      /** *********************************************** Surface Water *******************************************************************/
      // Surface Water - no depth 3.3% AEP
      ['fmp:surface_water_spatial_planning_1in30', 'Surface water - 3.3% AEP', 'SW'],
      ['fmp:surface_water_spatial_planning_1in30_ccp1', 'Surface water - 3.3% AEP', 'SW'],
      ['fmp:surface_water_spatial_planning_1in30_ccp2', 'Surface water - 3.3% AEP', 'SW'],
      // Surface Water - no depth 1% and 0.1% AEP
      ['fmp:surface_water_spatial_planning_1in100_1in1000', 'Surface water - 1% and 0.1% AEP', 'SW'],
      ['fmp:surface_water_spatial_planning_1in100_1in1000_ccp1', 'Surface water - 1% and 0.1% AEP', 'SW'],
      ['fmp:surface_water_spatial_planning_1in100_1in1000_ccp2', 'Surface water - 1% and 0.1% AEP', 'SW'],
      // Surface Water - depth 3.3% AEP
      ['fmp:surface_water_spatial_planning_1in30_depth', 'Surface water - 3.3% AEP - depth', 'SW'],
      ['fmp:surface_water_spatial_planning_1in30_depth_ccp1', 'Surface water - 3.3% AEP - depth', 'SW'],
      ['fmp:surface_water_spatial_planning_1in30_depth_ccp2', 'Surface water - 3.3% AEP - depth', 'SW'],
      // Surface Water - depth 1% AEP
      ['fmp:surface_water_spatial_planning_1in100_depth', 'Surface water - 1% AEP - depth', 'SW'],
      ['fmp:surface_water_spatial_planning_1in100_depth_ccp1', 'Surface water - 1% AEP - depth', 'SW'],
      ['fmp:surface_water_spatial_planning_1in100_depth_ccp2', 'Surface water - 1% AEP - depth', 'SW'],
      // Surface Water - depth 0.1% AEP
      ['fmp:surface_water_spatial_planning_1in1000_depth', 'Surface water - 0.1% AEP - depth', 'SW'],
      ['fmp:surface_water_spatial_planning_1in1000_depth_ccp1', 'Surface water - 0.1% AEP - depth', 'SW'],
      ['fmp:surface_water_spatial_planning_1in1000_depth_ccp2', 'Surface water - 0.1% AEP - depth', 'SW']
    ].reduce((availableLayers, [layerKey, layerTitle, layerType]) => {
      if (layerType === 'RS') {
        this._riversAndSeaLayers[layerTitle] = false // Boolean to toggle for visibility
      } else if (layerType === 'SW') {
        this._surfaceWaterLayers[layerTitle] = false
      } else if (layerType === 'other') {
        this._otherLayers[layerTitle] = false
      }
      this._allLayers[layerTitle] = false
      const climateChangeKey = layerType === 'other' ? 'other' : layerKey.match('ccp1') ? 'ccp1' : layerKey.match('ccp2') ? 'ccp2' : 'present-day'

      const layerDetails = availableLayers[layerTitle] || {}
      layerDetails[climateChangeKey] = { layerKey, layerTitle, layerType }

      return Object.assign(availableLayers, { [layerTitle]: layerDetails })
    }, {})

    // Assign the missing ccp2 to ccp1 so we dont get a blank layer
    this._availableLayers['Rivers and sea - 0.1% AEP - undefended depth'].ccp2 = this._availableLayers['Rivers and sea - 0.1% AEP - undefended depth'].ccp1
  }

  get baseMap () {
    return this._baseMap
  }

  set baseMap (baseMap) {
    this._baseMap = baseMap
    this.map.setVisibleBaseMapLayer(this._baseMap)
  }

  get climateChangeScenario () {
    return this._climateChangeScenario
  }

  set climateChangeScenario (climateChangeScenario) {
    this._climateChangeScenario = climateChangeScenario
    this.updateVisibleLayers()
  }

  get visibleLayers () {
    return this._visibleLayers
  }

  showHideLayer (layerTitle, show) {
    this._allLayers[layerTitle] = show
    this.updateVisibleLayers()
  }

  updateVisibleLayers () {
    this._visibleLayers = {}
    Object.entries(this._allLayers).forEach(([layerTitle, visible]) => {
      if (visible) {
        const layer = this._availableLayers[layerTitle][this._climateChangeScenario] || this._availableLayers[layerTitle].other
        this._visibleLayers[layer.layerKey] = true
      }
    })
  }

  addBaseMapRadioClickEvents (elementName) {
    const radios = document.getElementsByName(elementName)
    Array.from(radios).forEach((radio) => {
      radio.onclick = (event) => {
        this.baseMap = event.target.value
      }
    })
  }
}

module.exports = { MapController }
