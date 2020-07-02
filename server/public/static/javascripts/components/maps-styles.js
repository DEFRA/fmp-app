(function (window, maps) {
  var ol = window.ol
  var styles = {}

  function floods (feature, resolution) {
    // Defaults
    var strokeColour = 'transparent'
    var fillColour = 'transparent'
    var strokeWidth = 3
    var zIndex = 1
    var source = '/assets/images/icon-map-features-2x.png' // Icon sprite image source
    var offset = [0, 0] // Icon sprite offset
    var image = null
    var text = null
    var opacity = 1
    var lineDash = [0, 0]

    strokeWidth = 3

    if (feature.get('severity') === 1) {
      zIndex = 5
      offset = [0, 900]
    } else if (feature.get('severity') === 2) {
      zIndex = 4
      offset = [0, 1000]
    } else if (feature.get('severity') === 3) {
      zIndex = 3
      offset = [0, 1100]
    } else if (feature.get('severity') === 4) {
      return null
      /*
      zIndex = 2
      offset = [0, 1200]
      */
    }

    // Selected feature
    if (feature.get('isSelected') === true) {
      zIndex = 6
      offset[0] += 100
    }

    // Define icon
    image = new ol.style.Icon({
      src: source,
      size: [86, 86],
      anchor: [0.5, 0.75],
      scale: 0.5,
      offset: offset
    })

    // Generate style
    var style = new ol.style.Style({
      fill: new ol.style.Fill({ color: fillColour }),
      stroke: new ol.style.Stroke({
        color: strokeColour,
        width: strokeWidth,
        miterLimit: 2,
        lineJoin: 'round',
        lineDash: lineDash
      }),
      lineDash: lineDash,
      image: image,
      text: text,
      opacity: opacity,
      zIndex: zIndex
    })

    return style
  }

  function stations (feature, resolution) {
    var featureId = feature.getId()
    if (!featureId) {
      return
    }

    var props = feature.getProperties()
    var source = '/assets/images/icon-map-features-2x.png'
    var zIndex = 1
    var anchor = [0.5, 0.75]
    var offset

    switch (true) {
      case props.status === 'Suspended' || props.status === 'Closed':
        offset = [0, 0]
        zIndex = 1
        break
      case props.atrisk && props.type !== 'C' && props.type !== 'G':
        offset = [0, 300]
        zIndex = 3
        break
      case props.is_ffoi_at_risk:
        offset = [0, 200]
        zIndex = 4
        break
      default:
        offset = [0, 100]
        zIndex = 2
        break
    }

    if (resolution > 200) {
      offset[0] += 200
      anchor = [0.5, 0.5]
    }

    if (feature.get('isSelected') === true) {
      offset[0] += 100
      zIndex = 5
    }

    return [
      new ol.style.Style({
        image: new ol.style.Icon({
          src: source,
          size: [66, 84],
          anchor: anchor,
          scale: 0.5,
          offset: offset
        }),
        zIndex: zIndex
      })
    ]
  }

  function rain (feature, resolution) {
    var featureId = feature.getId()
    if (!featureId) {
      return
    }

    var source = '/assets/images/icon-map-features-2x.png'
    var zIndex = 1
    var anchor = [0.5, 0.75]
    var offset = [0, 1500]

    if (resolution > 200) {
      offset[0] += 200
      anchor = [0.5, 0.5]
    }

    if (feature.get('isSelected') === true) {
      offset[0] += 100
      zIndex = 5
    }

    return [
      new ol.style.Style({
        image: new ol.style.Icon({
          src: source,
          size: [66, 84],
          anchor: anchor,
          scale: 0.5,
          offset: offset
        }),
        zIndex: zIndex
      })
    ]
  }

  function impacts (feature, resolution) {
    var featureId = feature.getId()
    if (!featureId) {
      return
    }

    var source = '/assets/images/icon-map-features-2x.png'
    var zIndex = 1
    var anchor = [0.5, 0.75]
    var offset = [0, 500]

    if (resolution > 200) {
      offset[0] += 200
      anchor = [0.5, 0.5]
    }

    if (feature.get('isSelected') === true) {
      offset[0] += 100
      zIndex = 5
    }

    return [
      new ol.style.Style({
        image: new ol.style.Icon({
          src: source,
          size: [74, 74],
          anchor: anchor,
          scale: 0.5,
          offset: offset
        }),
        zIndex: zIndex
      })
    ]
  }

  function location (feature, resolution) {
    var offset = [0, 1300] // Icon sprite offset

    // Feature is also slected
    if (feature.get('isSelected') === true) {
      offset[0] += 100
    }

    // Generate style
    var style = new ol.style.Style({
      image: new ol.style.Icon({
        src: '/assets/images/icon-map-features-2x.png',
        size: [66, 84],
        anchor: [0.5, 0.92],
        scale: 0.5,
        offset: offset
      })
    })

    return style
  }

  // Style to highlight selected polygon
  function floodPolygon () {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'RGB(0, 0, 0, 0.2)'
      })
    })
  }

  styles.floods = floods
  styles.impacts = impacts
  styles.stations = stations
  styles.rain = rain
  styles.location = location
  styles.floodPolygon = floodPolygon

  maps.styles = styles
})(window, window.flood.maps)
