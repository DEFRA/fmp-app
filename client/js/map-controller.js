// FZ2 is equivalent to 0.1% AEP (i in 1000)
// FZ3 is equivalent to 1% AEP (i in 100)
// FZ3b (not specified by name) is equivalent to 3.3% AEP (i in 30)

class MapController {
  constructor (map) {
    this.map = map
    this._baseMap = 'Outdoor_27700'
  }

  initialise () {
    console.log('Initialising MapController')
    this.addBaseMapRadioClickEvents('base-map')
  }

  get baseMap () {
    return this._baseMap
  }

  set baseMap (baseMap) {
    this._baseMap = baseMap
    this.map.setVisibleBaseMapLayer(this._baseMap)
  }

  addBaseMapRadioClickEvents (elementName) {
    const radios = document.getElementsByName(elementName)
    Array.from(radios).forEach((radio) => {
      radio.onclick = (event) => {
        console.log('Radio On Click')
        this.baseMap = event.target.value
      }
    })
  }
}

module.exports = { MapController }
