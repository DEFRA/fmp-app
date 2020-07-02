/* global ol */

(function (window, flood) {
  var maps = flood.maps
  var model = flood.model

  var mapLive = maps.createLiveMap('map-live')
  var container = mapLive.container
  var map = mapLive.map
  var coordinates = model.place.center
  var name = model.place.name

  // Add locator
  container.addLocator(name, coordinates)

  // Duplicated: Ultimately needs to be in the MapContainer or somewhere else
  function showFeatureSet (map, state) {
    // Set layers in key
    var layers = document.querySelectorAll('.govuk-checkboxes__input')
    layers.forEach(input => {
      switch (input.id) {
        case 'severeFloodWarnings':
        case 'floodWarnings':
        case 'floodAlerts':
          input.checked = state === 'warnings' ? 'checked' : ''
          break
        case 'impacts':
          input.checked = state === 'impacts' ? 'checked' : ''
          break
        case 'stations':
          input.checked = state === 'stations' ? 'checked' : ''
          break
        case 'rain':
          input.checked = state === 'rain' ? 'checked' : ''
      }
    })
    // Set layers and/or features on map
    map.getLayers().forEach(function (layer) {
      switch (layer.get('ref')) {
        case 'floods-alert':
        case 'floods-warning':
        case 'floods-severe':
          state === 'warnings' ? layer.setVisible(true) : layer.setVisible(false)
          break
        case 'flood-centroids':
          if (state === 'warnings') {
            layer.getSource().forEachFeature(function (feature) { feature.setStyle(null) })
            layer.setVisible(true)
          } else {
            layer.getSource().forEachFeature(function (feature) { feature.setStyle(new ol.style.Style({})) })
            layer.setVisible(false)
          }
          break
        case 'impacts':
          state === 'impacts' ? layer.setStyle(maps.styles.impacts) : layer.setStyle(new ol.style.Style({}))
          break
        case 'stations':
          state === 'stations' ? layer.setStyle(maps.styles.stations) : layer.setStyle(new ol.style.Style({}))
          break
        case 'rain':
          state === 'rain' ? layer.setStyle(maps.styles.rain) : layer.setStyle(new ol.style.Style({}))
          break
      }
    })
  }

  if (document.getElementById('map-list-warnings')) {
    // Create map list
    var mapListWarning = flood.createMapList(document.getElementById('map-list-warnings'), {
      listButtonText: 'View alerts and warnings',
      mapButtonText: 'Map'
    })
    // Add map event
    mapListWarning.mapButton.addEventListener('click', function (e) {
      e.preventDefault()
      // Show map
      container.show()
      container.setCenter(coordinates)
      container.setZoom(11)
      showFeatureSet(map, 'warnings')
    })
  }

  if (document.getElementById('map-list-impacts')) {
    var mapListImpacts = flood.createMapList(document.getElementById('map-list-impacts'), {
      listButtonText: 'View historic flood impacts',
      mapButtonText: 'Map'
    })
    // Add map event
    mapListImpacts.mapButton.addEventListener('click', function (e) {
      e.preventDefault()
      // Show map
      container.show()
      container.setCenter(coordinates)
      container.setZoom(11)
      showFeatureSet(map, 'impacts')
    })
  }

  if (document.getElementById('map-list-stations')) {
    var mapListStations = flood.createMapList(document.getElementById('map-list-stations'), {
      listButtonText: 'View river and sea levels',
      mapButtonText: 'Map'
    })
    // Add map event
    mapListStations.mapButton.addEventListener('click', function (e) {
      e.preventDefault()
      // Show map
      container.show()
      container.setCenter(coordinates)
      container.setZoom(11)
      showFeatureSet(map, 'stations')
    })
  }
})(window, window.flood)
