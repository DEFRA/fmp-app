(function (window, flood) {
  function MapList (containerEl, settings) {
    var detailEl = containerEl.firstElementChild

    // Add map view button
    this.mapButton = document.createElement('button')
    this.mapButton.innerText = settings.mapButtonText
    this.mapButton.className = 'defra-button-map'
    containerEl.prepend(this.mapButton)

    // Optionally add list view button
    if (detailEl) {
      detailEl.setAttribute('hidden', 'hidden')
      this.listButton = document.createElement('button')
      this.listButton.innerText = settings.listButtonText
      this.listButton.className = 'defra-button-list'
      this.listButton.setAttribute('aria-controls', detailEl.id)
      this.listButton.setAttribute('aria-expanded', false)
      this.listButton.addEventListener('click', function (e) {
        if (this.getAttribute('aria-expanded') === 'true') {
          this.setAttribute('aria-expanded', false)
          detailEl.setAttribute('hidden', 'hidden')
        } else {
          this.setAttribute('aria-expanded', true)
          detailEl.removeAttribute('hidden')
        }
      })
      containerEl.prepend(this.listButton)
    }
  }
  flood.createMapList = function (containerEl, settings) {
    return new MapList(containerEl, settings)
  }
})(window, window.flood)
