(function (window, flood) {
  var ol = window.ol

  var maps = {}

  var extent = ol.proj.transformExtent([
    -5.75447130203247,
    49.9302711486816,
    1.79968345165253,
    55.8409309387207
  ], 'EPSG:4326', 'EPSG:3857')

  var center = [
    -1.4758,
    52.9219
  ]

  maps.extent = extent
  maps.center = center

  flood.maps = maps
})(window, window.flood)
