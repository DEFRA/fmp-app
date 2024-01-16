// FZ2 is equivalent to 0.1% AEP (i in 1000)
// FZ3 is equivalent to 1% AEP (i in 100)
// FZ3b (not specified by name) is equivalent to 3.3% AEP (i in 30)
const mapConfig = require('./map-config.json')
const TileLayer = require('ol/layer/Tile').default
const TileWMS = require('ol/source/TileWMS').default
const TileGrid = require('ol/tilegrid/TileGrid').default

class MapController {
  constructor () {
    this._baseMap = 'Outdoor_27700' // can be 'Outdoor_27700', 'Leisure_27700', 'Road_27700', 'Light_27700'
    this._climateChangeScenario = 'present-day' // can be present-day, ccp1, ccp2
    this._visibleLayers = {}
    this.initialiseAvailableLayers()
  }

  get map () {
    return this._map
  }

  set map (map) {
    this._map = map
  }

  initialiseAvailableLayers () {
    this._riversAndSeaLayersByTitle = {}
    this._surfaceWaterLayersByTitle = {}
    this._otherLayersByTitle = {}
    this._allLayersByKey = {}
    this._allLayersByTitle = {}
    this._mapLayers = []
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
        this._riversAndSeaLayersByTitle[layerTitle] = false // Boolean to toggle for visibility
      } else if (layerType === 'SW') {
        this._surfaceWaterLayersByTitle[layerTitle] = false
      } else if (layerType === 'other') {
        this._otherLayersByTitle[layerTitle] = false
      }
      this._allLayersByKey[layerKey] = layerTitle
      this._allLayersByTitle[layerTitle] = false
      const climateChangeKey = layerType === 'other' ? 'other' : layerKey.match('ccp1') ? 'ccp1' : layerKey.match('ccp2') ? 'ccp2' : 'present-day'

      const layerDetails = availableLayers[layerTitle] || {}
      layerDetails[climateChangeKey] = { layerKey, layerTitle, layerType }

      this._mapLayers.push(this.createNafra2Layer(layerKey, layerTitle, layerType))

      return Object.assign(availableLayers, { [layerTitle]: layerDetails })
    }, {})

    // Assign the missing ccp2 to ccp1 so we dont get a blank layer
    this._availableLayers['Rivers and sea - 0.1% AEP - undefended depth'].ccp2 = this._availableLayers['Rivers and sea - 0.1% AEP - undefended depth'].ccp1
  }

  get mapLayers () {
    return this._mapLayers.map((mapLayer) => mapLayer.layer)
  }

  get baseMap () {
    return this._baseMap
  }

  set baseMap (baseMap) {
    this._baseMap = baseMap
    this._map.setVisibleBaseMapLayer(this._baseMap)
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
    this._allLayersByTitle[layerTitle] = show
    this.updateVisibleLayers()
  }

  updateVisibleLayers () {
    this._visibleLayers = {}
    Object.entries(this._allLayersByTitle).forEach(([layerTitle, visible]) => {
      if (visible) {
        const layer = this._availableLayers[layerTitle][this._climateChangeScenario] || this._availableLayers[layerTitle].other
        this._visibleLayers[layer.layerKey] = true
      }
    })

    this._mapLayers.forEach(mapLayer => {
      mapLayer.layer.setVisible(this._visibleLayers[mapLayer.ref])
    })
  }

  // Map Layer functions
  createNafra2Layer (layerKey, layerTitle, type) {
    const ref = layerKey

    return {
      ref,
      name: layerTitle,
      type,
      layer: new TileLayer({
        ref,
        opacity: 0.7,
        zIndex: 0,
        visible: false,
        source: new TileWMS({
          url: mapConfig.tileProxy,
          serverType: 'geoserver',
          params: {
            LAYERS: layerKey,
            TILED: false,
            VERSION: '1.1.1'
          },
          tileGrid: new TileGrid({
            extent: mapConfig.tileExtent,
            resolutions: mapConfig.tileResolutions,
            tileSize: mapConfig.tileSize
          })
        })
      })
    }
  }

  // DOM interaction functions
  initialiseDom () {
    this.addBaseMapRadioClickEvents()
    this.addClimateChangeClickEvents()
    this.populateMapLayerList()
    this.addKeyLegendClickEvents()
  }

  addBaseMapRadioClickEvents (elementName = 'base-map') {
    const radios = document.getElementsByName(elementName)
    Array.from(radios).forEach(radio => {
      radio.onclick = event => (this.baseMap = event.target.value)
    })
  }

  addClimateChangeClickEvents (elementName = 'climate-change') {
    const radios = document.getElementsByName(elementName)
    Array.from(radios).forEach(radio => {
      radio.onclick = event => (this.climateChangeScenario = event.target.value)
    })
  }

  addKeyLegendClickEvents (elementName = 'climate-change') {
    const tabs = document.querySelectorAll('#mapKeyLabel span')
    Array.from(tabs).forEach(tab => {
      tab.onclick = event => {
        const show = tab.getAttribute('data-show')
        const hide = tab.getAttribute('data-hide')
        document.querySelector(show).classList.remove('hidden')
        document.querySelector(hide).classList.add('hidden')
        Array.from(tabs).forEach(tabForRemove => tabForRemove.classList.remove('active'))
        Array.from(tabs).forEach(tabForRemove => tabForRemove.classList.add('inactive'))
        tab.classList.add('active')
        tab.classList.remove('inactive')
        if (show === '.map-legend-legend') {
          this.buildDynamicLegend()
        }
      }
    })
  }

  buildDynamicLegend () {
    // TODO - Hard Code the 'other' layers
    const layersToFetch = Object.assign({}, this._visibleLayers)
    delete layersToFetch['fmp:defences']
    delete layersToFetch['fmp:main_rivers_10k']
    delete layersToFetch['fmp:flood_storage_areas']

    global.fetch('/flood-map-legend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(layersToFetch)
    })
      .then(response => response.json())
      .then(legendResponse => {
        console.log('fetch response', legendResponse)
        const legendElement = document.querySelector('.map-legend-legend')
        const legendText = legendResponse.reduce((legendText, { key, rules }) => {
          const title = this._allLayersByKey[key]
          legendText += '<div class="govuk-body-s govuk-!-font-size-14">'
          legendText += `<h3 class="heading-small">${title}</h3>`
          legendText += rules
            .sort(({ name: nameA }, { name: nameB }) => {
              if (nameA.startsWith('<') || nameB.startsWith('>')) {
                return -1
              }
              const intA = parseInt(nameA, 10)
              const intB = parseInt(nameB, 10)
              if (isNaN(intA) || isNaN(intB)) {
                return 0
              }
              return intA - intB
            })
            .reduce((rulesText, { name, fill }) => {
              const colourBox = `<div class="color-box" style="background-color: ${fill};"></div>`
              rulesText += `<div class='legend-item'>
            <label>${name}:</label>${colourBox}
            </div>`
              return rulesText
            }, '')
          legendText += '</div>'
          return legendText
        }, '')
        legendElement.innerHTML = legendText
      })
  }

  populateMapLayerList () {
    const riversAndSeaLayers = Object.assign({}, this._otherLayersByTitle, this._riversAndSeaLayersByTitle)
    const riversAndSeaFragment = document.createDocumentFragment()
    Object.keys(riversAndSeaLayers).forEach((layerName) => this.buildLayerFragment(riversAndSeaFragment, layerName))
    document.querySelector('#rivers-and-sea-layers').appendChild(riversAndSeaFragment)

    const surfaceWaterFragment = document.createDocumentFragment()
    Object.keys(this._surfaceWaterLayersByTitle).forEach((layerName) => this.buildLayerFragment(surfaceWaterFragment, layerName))
    document.querySelector('#surface-water-layers').appendChild(surfaceWaterFragment)
  }

  buildLayerFragment (fragment, layerName) {
    const div = fragment.appendChild(document.createElement('div'))
    div.className = 'layer-toggle-container'
    const input = div.appendChild(document.createElement('input'))
    input.setAttribute('type', 'checkbox')
    input.setAttribute('id', layerName)
    input.setAttribute('name', layerName)
    input.checked = false
    input.addEventListener('change', event => {
      this.showHideLayer(layerName, event.target.checked)
    })
    const label = div.appendChild(document.createElement('label'))
    label.setAttribute('for', layerName)
    label.textContent = layerName
  }
}

module.exports = { MapController }
