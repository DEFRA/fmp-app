(function (window, maps) {
  var ol = window.ol
  var layers = {}

  function road () {
    return new ol.layer.Tile({
      ref: 'bing-road',
      source: new ol.source.BingMaps({
        key: 'Ajou-3bB1TMVLPyXyNvMawg4iBPqYYhAN4QMXvOoZvs47Qmrq7L5zio0VsOOAHUr',
        imagerySet: 'RoadOnDemand'
      }),
      // source: new ol.source.OSM(),
      visible: true,
      zIndex: 0
    })
  }

  function satellite () {
    return new ol.layer.Tile({
      ref: 'bing-aerial',
      source: new ol.source.BingMaps({
        key: 'Ajou-3bB1TMVLPyXyNvMawg4iBPqYYhAN4QMXvOoZvs47Qmrq7L5zio0VsOOAHUr',
        imagerySet: 'AerialWithLabelsOnDemand'
      }),
      visible: false
    })
  }

  function floodPolygonsSevere () {
    return new ol.layer.Image({
      ref: 'floods-severe',
      maxResolution: 200,
      source: new ol.source.ImageWMS({
        url: '/ows?service=wms',
        serverType: 'geoserver',
        params: {
          LAYERS: 'flood_warning_alert',
          CQL_FILTER: 'severity = 1'
        }
      }),
      visible: false
    })
  }

  function floodPolygonsWarning () {
    return new ol.layer.Image({
      ref: 'floods-warning',
      maxResolution: 200,
      source: new ol.source.ImageWMS({
        url: '/ows?service=wms',
        serverType: 'geoserver',
        params: {
          LAYERS: 'flood_warning_alert',
          CQL_FILTER: 'severity = 2'
        }
      }),
      visible: false
    })
  }

  function floodPolygonsAlert () {
    return new ol.layer.Image({
      ref: 'floods-alert',
      maxResolution: 200,
      source: new ol.source.ImageWMS({
        url: '/ows?service=wms',
        serverType: 'geoserver',
        params: {
          LAYERS: 'flood_warning_alert',
          CQL_FILTER: 'severity = 3'
        }
      }),
      visible: false
    })

    /*
    return new ol.layer.Vector({
      ref: 'floods-alert',
      maxResolution: 200,
      source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        loader: function(extent, resolution, projection) {
          var source = this
          var proj = projection.getCode();
          var url = '/ows?service=wfs&' +
              'version=1.3.0&request=GetFeature&typename=flood:flood_warning_alert&' +
              'outputFormat=application/json&srsname=' + proj + '&' +
              'bbox=' + extent.join(',') + ',' + proj
          var xhr = new XMLHttpRequest()
          xhr.open('GET', url)
          var onError = function() {
            source.removeLoadedExtent(extent)
          }
          xhr.onerror = onError
          xhr.onload = function() {
            if (xhr.status == 200) {
              source.addFeatures(source.getFormat().readFeatures(xhr.responseText))
            } else {
              onError()
            }
          }
          xhr.send()
        },
        strategy: ol.loadingstrategy.bbox
      })
    })
    */
  }

  function floodPolygonsNotInForce () {
    return new ol.layer.Image({
      ref: 'floods-notinforce',
      maxResolution: 200,
      source: new ol.source.ImageWMS({
        url: '/ows?service=wms',
        serverType: 'geoserver',
        params: {
          LAYERS: 'flood_warning_alert',
          CQL_FILTER: 'severity = 4'
        }
      }),
      visible: false
    })
  }

  function floodPolygon () {
    return new ol.layer.Vector({
      ref: 'flood-polygon',
      maxResolution: 200,
      style: maps.styles.floodPolygon
    })
  }

  function floodCentroids () {
    return new ol.layer.Vector({
      ref: 'flood-centroids',
      minResolution: 200,
      source: new ol.source.Vector({
        url: '/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=flood:flood_warning_alert_centroid&maxFeatures=10000&outputFormat=application/json',
        format: new ol.format.GeoJSON()
      }),
      style: maps.styles.floods,
      visible: false
    })
  }

  function stations () {
    return new ol.layer.Vector({
      ref: 'stations',
      title: 'stations',
      source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        projection: 'EPSG:3857',
        url: '/api/stations.geojson'
      }),
      style: new ol.style.Style({})
    })
  }

  // function rain () {
  //   var geojsonObject = {
  //     'type': 'FeatureCollection',
  //     'features': [
  //       {
  //         'type': 'Feature',
  //         'id': 'rain.50112',
  //         'properties': {
  //           'label': 'Rain gauge name',
  //           'gridRef': 'SS777481',
  //           'value': 0,
  //           'latestDate': '2019-02-12T04:00:00Z'
  //         },
  //         'geometry': {
  //           'type': 'Point',
  //           'coordinates': [
  //             -3.75,
  //             51.22
  //           ]
  //         }
  //       },
  //       {
  //         'type': 'Feature',
  //         'id': 'rain.45101',
  //         'properties': {
  //           'label': 'Rain gauge name',
  //           'gridRef': 'SS770391',
  //           'value': 0,
  //           'latestDate': '2019-02-12T04:00:00Z'
  //         },
  //         'geometry': {
  //           'type': 'Point',
  //           'coordinates': [
  //             -3.76,
  //             51.14
  //           ]
  //         }
  //       },
  //       {
  //         'type': 'Feature',
  //         'id': 'rain.45100',
  //         'properties': {
  //           'label': 'Rain gauge name',
  //           'gridRef': 'SS763417',
  //           'value': 0,
  //           'latestDate': '2019-02-12T04:00:00Z'
  //         },
  //         'geometry': {
  //           'type': 'Point',
  //           'coordinates': [
  //             -3.77,
  //             51.16
  //           ]
  //         }
  //       }
  //     ]
  //   }

  //   var features = new ol.format.GeoJSON().readFeatures(geojsonObject, {
  //     featureProjection: 'EPSG:3857'
  //   })

  //   return new ol.layer.Vector({
  //     ref: 'rain',
  //     title: 'rain',
  //     source: new ol.source.Vector({
  //       features: features
  //     }),
  //     style: maps.styles.rain,
  //     visible: false
  //   })
  // }

  function rain () {
    return new ol.layer.Vector({
      ref: 'rain',
      title: 'rain',
      source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        projection: 'EPSG:3857',
        url: '/rainfall'
      }),
      style: new ol.style.Style({})
    })
    // return new ol.layer.Vector({
    //   ref: 'rain',
    //   title: 'rain',
    //   source: new ol.source.Vector({
    //     features: features
    //   }),
    //   style: maps.styles.rain,
    //   visible: false
    // })
  }

  function impacts () {
    return new ol.layer.Vector({
      ref: 'impacts',
      title: 'impacts',
      source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        projection: 'EPSG:3857',
        url: '/impacts'
      }),
      style: new ol.style.Style({})
    })
    // return new ol.layer.Vector({
    //   ref: 'rain',
    //   title: 'rain',
    //   source: new ol.source.Vector({
    //     features: features
    //   }),
    //   style: maps.styles.rain,
    //   visible: false
    // })
  }

  function location (name, center) {
    var feature = new window.ol.Feature({
      geometry: new window.ol.geom.Point(window.ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857')),
      type: 'location',
      html: name
    })
    feature.setId('location')
    var locationPoint = new window.ol.source.Vector({
      features: [feature]
    })

    return new window.ol.layer.Vector({
      ref: 'location',
      renderMode: 'hybrid',
      source: locationPoint,
      style: maps.styles.location,
      zIndex: 2
    })
  }

  function selectedPointFeature () {
    return new window.ol.layer.Vector({
      ref: 'selected-point-feature',
      renderMode: 'hybrid',
      zIndex: 10
    })
  }

  layers.road = road
  layers.satellite = satellite
  layers.floodsSevere = floodPolygonsSevere
  layers.floodsWarning = floodPolygonsWarning
  layers.floodsAlert = floodPolygonsAlert
  layers.floodsNotInForce = floodPolygonsNotInForce
  layers.floodPolygon = floodPolygon
  layers.floodCentroids = floodCentroids
  layers.stations = stations
  layers.impacts = impacts
  layers.rain = rain
  layers.location = location
  layers.selectedPointFeature = selectedPointFeature

  maps.layers = layers
})(window, window.flood.maps)
