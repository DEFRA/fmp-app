// This file represents the map container.
// It is responsible for initialising the map
// using the ol.view, layers and other options passed.
// It also controls the zoom, full screen controls, responsiveness etc.
// No implementation details specific to a map should be in here.
// This is a generic container that could be reused for LTFRI maps, FMfP etc.
// ***To include a key, include an element with `.map-key__container` in the main inner element.
// To include a key pass its template name as an option

(function (window, flood) {
  var ol = window.ol
  var maps = flood.maps
  var addOrUpdateParameter = flood.utils.addOrUpdateParameter
  var getParameterByName = flood.utils.getParameterByName

  function MapContainer (el, options) {
    var defaults = {
      minIconResolution: 200,
      keyTemplate: ''
    }

    this.options = Object.assign({}, defaults, options)

    //
    // Map to DOM container elements
    //

    this.element = el.firstElementChild
    this.mapContainerInnerElement = el.firstElementChild.firstElementChild

    var hasKey = false
    // Experimental adding key via client side template

    if (this.options.keyTemplate !== '') {
      var keyHtml = window.nunjucks.render(this.options.keyTemplate)
      hasKey = true
      this.keyElement = document.createElement('div')
      this.keyElement.innerHTML = keyHtml
      this.keyElement.className = 'map-key'

      // Key toggle button
      this.keyToggleElement = document.createElement('button')
      this.keyToggleElement.innerHTML = 'Key'
      this.keyToggleElement.title = 'Add or remove information from the map'
      this.keyToggleElement.className = 'map-key__toggle'
      this.keyToggleElement.addEventListener('click', function (e) {
        // Toggle key
        if (!this.isKeyOpen) {
          this.openKey()
        } else {
          this.closeKey()
        }
      }.bind(this))
    }

    // Overlay component
    this.overlayInnerElement = document.createElement('div')
    this.overlayInnerElement.classList.add('ol-overlay-inner')

    // Zoom buttons
    this.zoomButton = document.createElement('button')
    this.zoomButton.appendChild(document.createTextNode('Zoom'))
    this.zoomButton.className = 'ol-zoom'
    var zoom = new ol.control.Zoom({
      element: this.zoomButton
    })

    // Hide map
    var historyAdvanced = false
    this.hideMapButton = document.createElement('button')
    this.hideMapButton.className = 'ol-full-screen ol-full-screen-back'
    this.hideMapButton.appendChild(document.createTextNode('Exit map'))
    this.hideMapButton.addEventListener('click', function (e) {
      if (historyAdvanced) {
        window.history.back()
      } else {
        this.removeFullScreen()
        var state = { v: '' }
        var title = document.title
        var url = addOrUpdateParameter(window.location.pathname + window.location.search, 'v', '')
        window.history.replaceState(state, title, url)
        historyAdvanced = false
      }
      // Todo - set keyboard focus to the next link
    }.bind(this))
    this.hideMapButton.addEventListener('keyup', function (e) {
      if (e.keyCode === 13 || e.keyCode === 32) {
        this.showMapButton.style.display === 'none' ? this.hideMapButton.focus() : this.showMapButton.focus()
      }
    }.bind(this))

    // Show map
    this.show = function () {
      this.setFullScreen()
      var state = { v: el.id }
      var title = document.title
      var url = addOrUpdateParameter(window.location.pathname + window.location.search, 'v', el.id)
      window.history.pushState(state, title, url)
      historyAdvanced = true
    }.bind(this)
    var view = this.options.view

    // Add key and fullscreen buttons
    if (hasKey) {
      el.classList.add('map--has-key')
      this.mapContainerInnerElement.appendChild(this.keyElement)
      this.keyElement.insertBefore(this.keyToggleElement, this.keyElement.firstChild)
      this.keyElement.prepend(this.hideMapButton)
    } else {
      this.mapContainerInnerElement.prepend(this.hideMapButton)
    }

    // Add remaining controls
    var controls = ol.control.defaults({
      zoom: false,
      rotate: false,
      attribution: false
    }).extend([zoom])

    // Add layers to map
    var layers = this.options.layers

    // Render map
    var map = new ol.Map({
      target: this.mapContainerInnerElement,
      controls: controls,
      layers: layers,
      view: view
      /*
      interactions: ol.interaction.defaults({
        mouseWheelZoom: false
      })
      */
    })

    // Set center
    this.setCenter = function (coordinates) {
      var center = ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857')
      map.getView().setCenter(center)
    }

    // Set zoom
    this.setZoom = function (zoom) {
      map.getView().setZoom(zoom)
    }

    // Add locator: Could this be an exception as a locator may be common to all maps?
    this.addLocator = function (name, coordinates) {
      map.addLayer(maps.layers.location(name, coordinates))
    }

    // Add mouse wheel zoom interaction
    var mouseWheelZoom = new ol.interaction.MouseWheelZoom()
    map.addInteraction(mouseWheelZoom)

    this.map = map

    // Open key
    if (this.isKeyOpen) {
      this.openKey()
    }

    //
    // Map events
    //

    // Close key or overlay if map is clicked
    map.on('click', function (e) {
      // Re-enable mouse wheel scroll
      // mouseWheelZoom.setActive(true)

      // Hide overlay if exists
      this.hideOverlay()

      // Set a short timeout to allow downstream events to fire
      // and set `e.hit`. Hide the key when nothing is clicked (hit).
      setTimeout(function () {
        if (hasKey && this.isKeyOpen) {
          this.closeKey()
        }
      }.bind(this), 100)
    }.bind(this))

    // Disable mouse wheel when point moves away from the map
    el.addEventListener('mouseout', function (e) {
      mouseWheelZoom.setActive(false)
    })

    // Set fullscreen state
    this.setFullScreen = function () {
      el.removeAttribute('hidden')
      el.classList.add('map--fullscreen')
      this.isFullScreen = true
      map.updateSize()
    }

    // Remove fullscreen state
    this.removeFullScreen = function () {
      el.setAttribute('hidden', true)
      el.classList.remove('map--fullscreen')
      this.isFullScreen = false
      map.updateSize()
    }

    // Open key
    this.openKey = function () {
      if (!this.isFullScreen) {
        this.hideMapButton.click()
      }
      el.classList.add('map--key-open')
      this.keyToggleElement.innerHTML = 'Close'
      this.isKeyOpen = true
    }

    // Close key
    this.closeKey = function () {
      el.classList.remove('map--key-open')
      this.keyToggleElement.innerHTML = 'Key'
      this.isKeyOpen = false
    }

    // Show overlay
    this.showOverlay = function (feature) {
      feature.set('isSelected', true)
      // Store selected feature
      this.selectedFeature = feature
      // Add class to map
      el.classList.add('map--overlay-open')
      // Add feature html
      this.overlayInnerElement.innerHTML = feature.get('html')

      // Create overlay object
      this.overlay = new ol.Overlay({
        element: this.overlayInnerElement,
        positioning: 'bottom-left',
        insertFirst: false,
        className: 'ol-overlay'
      })

      this.overlay.element.style.display = 'block'
      map.addOverlay(this.overlay)
    }

    // Hide overlay
    this.hideOverlay = function () {
      // Add class to map
      el.classList.remove('map--overlay-open')
      // Disable last selected feature
      if (this.selectedFeature) {
        // Target areas have two point and polygon on different layers
        this.selectedFeature.set('isSelected', false)
        this.selectedFeature = null
      }

      // Remove overlay object
      if (this.overlay) {
        map.removeOverlay(this.overlay)
      }
    }

    // Set fullscreen state
    if (getParameterByName('v') === el.id) {
      this.setFullScreen()
    }

    // Toggle fullscreen view on browser history change
    window.addEventListener('popstate', function (e) {
      if (e && e.state && getParameterByName('v') === el.id) {
        this.setFullScreen()
      } else {
        this.removeFullScreen()
      }
    }.bind(this))

    // Constrain keyboard focus
    this.element.addEventListener('keydown', function (e) {
      if (this.element.contains(document.activeElement)) {
        // Tab key
        if (e.keyCode === 9) {
          if (this.isFullScreen) {
            // Select only elements that can have focus
            var focusableElements = this.element.querySelectorAll('button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            // Filter to remove any elements that are not currently visible
            var validElements = []
            for (var i = 0; i < focusableElements.length; i++) {
              if (focusableElements[i].offsetParent !== null) {
                validElements.push(focusableElements[i])
              }
            }
            // Set first and last focusable elements
            var firstFocusableElement = validElements[0]
            var lastFocusableElement = validElements[validElements.length - 1]
            // Shift tab (backwards)
            if (e.shiftKey) {
              if (document.activeElement === firstFocusableElement) {
                e.preventDefault()
                lastFocusableElement.focus()
              }
            } else {
              // Tab (forwards)
              if (document.activeElement === lastFocusableElement) {
                e.preventDefault()
                firstFocusableElement.focus()
              }
            }
          }
        }
        // Add map pan (cursor keys)
        // Add map zoom (plus and minus keys)
      }
    }.bind(this))
  }

  maps.MapContainer = MapContainer
})(window, window.flood)
