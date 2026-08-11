class MapState {
  defraMapConfig = null
  interactiveMap = null
  map = null
  view = null
  visibleLayers = null // The vectorTile layers that are currently visible on the map
  cursorStyleLayer = null // The style layer that the cursor or target is currently over, if any
  cursorAttributes = null // The attributes of the feature that the cursor or target is currently over, if any
  styleToValuesMap = {} // A map of esriStyleLayerId to infoPanelData values, used to get the info panel data for a given style layer

  updateVisibleLayers () {
    this.visibleLayers = this.map?.allLayers?.items?.filter((item) =>
      item.type === 'vector-tile' &&
      item.visible === true &&
      item.id !== 'baselayer'
    )
  }

  getInfoPanelDataForEsriStyleLayerId (esriStyleLayerId) {
    return this.styleToValuesMap[esriStyleLayerId] || null
  }

  assignCursorStyleLayer (hitTestResponse) {
    let topHitTestData = null
    if (hitTestResponse?.results?.length > 0) {
      const visibleHitTestData = hitTestResponse?.results.reduce((hitTestData, result) => {
        const { layerId } = result.graphic?.origin || {}
        const { attributes } = result.graphic
        if (!layerId) {
          return hitTestData
        }
        const vtLayer = result.layer
        const styleLayer = vtLayer?.getStyleLayer(layerId)
        if (styleLayer?.layout?.visibility === 'visible') {
          hitTestData.push({ layerId, attributes })
        }
        return hitTestData
      }, [])

      topHitTestData = visibleHitTestData?.[0] || null
    }
    mapState.cursorStyleLayer = topHitTestData?.layerId || null
    mapState.cursorAttributes = topHitTestData?.attributes || null
    document.body.style.cursor = mapState.cursorStyleLayer ? 'pointer' : 'default'
  }
}

const mapState = new MapState()

export { mapState }
