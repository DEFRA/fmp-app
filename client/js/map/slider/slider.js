'use strict'
/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   slider-opacity-viewer.js
 *
 *   Desc:   OpacitySlider widget that implements ARIA Authoring Practices
 */

// Create OpacitySlider that contains value, valuemin, valuemax, and valuenow
import { FloodMapLayer } from '../mapLayers/index.js'

const SNAP_VALUE = 5
const PAGE_DOWN_VALUE = 10

const snap = (value) => Math.round(value / SNAP_VALUE) * SNAP_VALUE
const ARIA_NOW = 'aria-valuenow'
const MIN_VALUE = 0
const MAX_VALUE = 100
const RANGE = 100

class OpacitySlider {
  constructor (containerId) {
    this.containerId = containerId
    this.pointerSlider = false

    this.slider = {}

    this.svgWidth = 250 // 310
    this.svgHeight = 50
    this.borderWidth = 2

    this.valueY = 20

    this.railX = 15
    this.railY = 26
    this.railWidth = 225 // 275
    this.railHeight = 14

    this.thumbHeight = this.railHeight
    this.thumbWidth = this.thumbHeight
    this.rectRadius = this.railHeight / 4

    this.focusY = this.borderWidth
    this.focusWidth = 36
    this.focusHeight = 48

    document.body.addEventListener('pointerup', this.onThumbPointerUp.bind(this))
  }

  checkAndAttach () {
    // This is called to ensure that the slider functionality is attached to the
    // slider code, as and when the MC re-renders the mark up for the slider - which creates a
    // new dom element.
    const container = document.getElementById(this.containerId)
    if (!container) {
      // Nothing to attach to as the map component is not showing the panel that contains the slider.
      return
    }
    const sliderNode = container.querySelector('.opacity-slider')
    // check if the element is already attached
    if (this.domNode !== container || sliderNode !== this.slider.sliderNode) {
      // re-attach the slider code if it isn't attached.
      this.domNode = container
      this.initSliderRefs()
      this.init()
    }
  }

  initSliderRefs () {
    this.slider = {}
    const node = this.domNode.querySelector('.opacity-slider')
    this.slider.sliderNode = node

    this.slider.svgNode = node.querySelector('svg')
    this.slider.svgNode.setAttribute('width', this.svgWidth)
    this.slider.svgNode.setAttribute('height', this.svgHeight)
    this.slider.svgPoint = this.slider.svgNode.createSVGPoint()

    this.slider.valueNode = node.querySelector('.value')
    this.slider.valueNode.setAttribute('y', this.valueY)

    this.slider.thumbNode = node.querySelector('.thumb')
    this.slider.thumbNode.setAttribute('width', this.thumbWidth)
    this.slider.thumbNode.setAttribute('height', this.thumbHeight)
    this.slider.thumbNode.setAttribute('y', this.railY)
    this.slider.thumbNode.setAttribute('rx', this.rectRadius)

    this.slider.focusNode = node.querySelector('.focus')
    this.slider.focusNode.setAttribute('width', this.focusWidth - this.borderWidth)
    this.slider.focusNode.setAttribute('height', this.focusHeight - this.borderWidth)
    this.slider.focusNode.setAttribute('y', this.focusY)
    this.slider.focusNode.setAttribute('rx', this.rectRadius)

    this.slider.railNode = node.querySelector('.opacity-slider .rail')
    this.slider.railNode.setAttribute('x', this.railX)
    this.slider.railNode.setAttribute('y', this.railY)
    this.slider.railNode.setAttribute('width', this.railWidth)
    this.slider.railNode.setAttribute('height', this.railHeight)
    this.slider.railNode.setAttribute('rx', this.rectRadius)

    this.slider.fillNode = node.querySelector('.opacity-slider .fill')
    this.slider.fillNode.setAttribute('x', this.railX)
    this.slider.fillNode.setAttribute('y', this.railY)
    this.slider.fillNode.setAttribute('width', this.railWidth)
    this.slider.fillNode.setAttribute('height', this.railHeight)
    this.slider.fillNode.setAttribute('rx', this.rectRadius)
  }

  // Initialize slider
  init () {
    if (this.slider.sliderNode.tabIndex !== 0) {
      this.slider.sliderNode.tabIndex = 0
    }

    this.slider.railNode.addEventListener('click', this.onRailClick.bind(this))
    this.slider.sliderNode.addEventListener('keydown', this.onSliderKeyDown.bind(this))
    this.slider.sliderNode.addEventListener('pointerdown', this.onThumbPointerDown.bind(this))
    this.slider.valueNode.addEventListener('keydown', this.onSliderKeyDown.bind(this))
    this.slider.valueNode.addEventListener('pointerdown', this.onThumbPointerDown.bind(this))
    this.slider.sliderNode.addEventListener('pointermove', this.onThumbPointerMove.bind(this))

    this.moveSliderTo(FloodMapLayer.opacity * 100)
  }

  // Get point in global SVG space
  getSVGPoint (event) {
    this.slider.svgPoint.x = event.clientX
    this.slider.svgPoint.y = event.clientY
    return this.slider.svgPoint.matrixTransform(this.slider.svgNode.getScreenCTM().inverse())
  }

  getValueNow () {
    return parseInt(this.slider.sliderNode.getAttribute(ARIA_NOW))
  }

  moveSliderTo (value) {
    const valueNow = Math.min(Math.max(value, MIN_VALUE), MAX_VALUE)

    this.slider.sliderNode.setAttribute(ARIA_NOW, valueNow)

    const offsetX = Math.round(
      (valueNow * (this.railWidth - this.thumbWidth)) / (RANGE)
    )

    let pos = this.railX + offsetX

    this.slider.thumbNode.setAttribute('x', pos)
    this.slider.fillNode.setAttribute('width', offsetX + this.rectRadius)

    this.slider.valueNode.textContent = valueNow
    const valueWidth = this.slider.valueNode.getBBox().width

    pos = this.railX + offsetX - (valueWidth - this.thumbWidth) / 2
    this.slider.valueNode.setAttribute('x', pos)

    pos = this.railX + offsetX - (this.focusWidth - this.thumbWidth) / 2
    this.slider.focusNode.setAttribute('x', pos)

    const opacity = this.slider.sliderNode.getAttribute(ARIA_NOW)
    // Change the opacity on the FloodMapLayer - which triggers a redraw
    FloodMapLayer.opacity = opacity / 100
  }

  getSliderPositionForKey (key, valueNow) {
    switch (key) {
      case 'Left':
      case 'ArrowLeft':
      case 'Down':
      case 'ArrowDown':
        return valueNow - SNAP_VALUE
      case 'Right':
      case 'ArrowRight':
      case 'Up':
      case 'ArrowUp':
        return valueNow + SNAP_VALUE
      case 'PageDown':
        return valueNow - PAGE_DOWN_VALUE
      case 'PageUp':
        return valueNow + PAGE_DOWN_VALUE
      case 'Home':
        return MIN_VALUE
      case 'End':
        return MAX_VALUE
      default:
        return null
    }
  }

  onSliderKeyDown (event) {
    const valueNow = this.getValueNow()
    const newValue = this.getSliderPositionForKey(event.key, valueNow)
    if (newValue !== null) {
      this.moveSliderTo(newValue)
      event.preventDefault()
      event.stopPropagation()
    }
  }

  onThumbPointerDown (event) {
    this.pointerSlider = this.slider

    // Set focus to the clicked on
    this.pointerSlider.sliderNode.focus()

    event.preventDefault()
    event.stopPropagation()
  }

  onThumbPointerUp () {
    this.pointerSlider = false
  }

  onThumbPointerMove (event) {
    if (
      this.pointerSlider &&
      this.pointerSlider.sliderNode.contains(event.target)
    ) {
      const x = this.getSVGPoint(event).x
      const diffX = x - this.railX
      const value = snap(Math.round((diffX * (RANGE)) / this.railWidth))
      this.moveSliderTo(value)

      event.preventDefault()
      event.stopPropagation()
    }
  }

  // handle click event on the rail
  onRailClick (event) {
    const x = this.getSVGPoint(event).x
    const diffX = x - this.railX
    const value = snap(Math.round((diffX * (RANGE)) / this.railWidth))
    this.moveSliderTo(value)

    event.preventDefault()
    event.stopPropagation()

    // Set focus to the clicked handle
    this.slider.sliderNode.focus()
  }
}

export { OpacitySlider }
