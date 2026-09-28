const { Slider, DEFAULT_MIN_VALUE, DEFAULT_MAX_VALUE } = require('./slider.js')

// Builds the markup OpacitySlider.jsx renders, with jsdom-friendly SVG geometry stubs
const buildSliderMarkup = () => {
  document.body.innerHTML = `
    <div id="opacity-control">
      <div class="opacity-slider" role="slider" tabindex="0">
        <svg width="250" height="50">
          <text class="value" x="0" y="20">0</text>
          <rect class="rail" x="15" y="26" rx="3.5" width="225" height="14" />
          <rect class="fill" x="15" y="26" rx="3.5" width="0" height="14" />
          <rect class="thumb" x="15" y="26" rx="3.5" width="14" height="14" />
          <rect class="focus" x="0" y="2" rx="3.5" width="34" height="46" />
        </svg>
      </div>
    </div>
  `
  const svg = document.querySelector('svg')
  // jsdom does not implement SVG geometry APIs, so stub the ones the slider relies on
  svg.createSVGPoint = () => ({
    x: 0,
    y: 0,
    matrixTransform () {
      return { x: this.x, y: this.y }
    }
  })
  svg.getScreenCTM = () => ({ inverse: () => ({}) })
  const valueNode = document.querySelector('.value')
  valueNode.getBBox = () => ({ width: 20 })
  return svg
}

describe('Slider', () => {
  beforeEach(() => {
    buildSliderMarkup()
  })

  describe('construction', () => {
    it('should default the min/max/snap/page-down values', () => {
      const slider = new Slider('opacity-control')

      expect(slider.minValue).toBe(DEFAULT_MIN_VALUE)
      expect(slider.maxValue).toBe(DEFAULT_MAX_VALUE)
      expect(slider.range).toBe(DEFAULT_MAX_VALUE - DEFAULT_MIN_VALUE)
    })

    it('should allow overriding the default options', () => {
      const slider = new Slider('opacity-control', { minValue: 10, maxValue: 90 })

      expect(slider.minValue).toBe(10)
      expect(slider.maxValue).toBe(90)
      expect(slider.range).toBe(80)
    })
  })

  describe('checkAndAttach', () => {
    it('should do nothing when the container is not in the DOM', () => {
      document.body.innerHTML = ''
      const slider = new Slider('opacity-control')

      expect(() => slider.checkAndAttach(50, jest.fn())).not.toThrow()
      expect(slider.domNode).toBeUndefined()
    })

    it('should attach to the container and initialise the slider markup', () => {
      const slider = new Slider('opacity-control')

      slider.checkAndAttach(60, jest.fn())

      const svg = document.querySelector('svg')
      expect(svg.getAttribute('width')).toBe('250')
      expect(svg.getAttribute('height')).toBe('50')
      expect(document.querySelector('.opacity-slider').getAttribute('aria-valuenow')).toBe('60')
    })

    it('should set the slider tabIndex to 0 when the markup does not already have one', () => {
      buildSliderMarkup()
      document.querySelector('.opacity-slider').removeAttribute('tabindex')
      const slider = new Slider('opacity-control')

      slider.checkAndAttach(60, jest.fn())

      expect(document.querySelector('.opacity-slider').tabIndex).toBe(0)
    })

    it('should not re-attach when already attached to the same node', () => {
      const slider = new Slider('opacity-control')
      const onChange = jest.fn()
      slider.checkAndAttach(60, onChange)
      const initSpy = jest.spyOn(slider, 'initSliderRefs')

      slider.checkAndAttach(70, onChange)

      expect(initSpy).not.toHaveBeenCalled()
    })

    it('should re-attach when the underlying slider node has been replaced', () => {
      const slider = new Slider('opacity-control')
      slider.checkAndAttach(60, jest.fn())

      buildSliderMarkup()
      const initSpy = jest.spyOn(slider, 'initSliderRefs')
      slider.checkAndAttach(70, jest.fn())

      expect(initSpy).toHaveBeenCalled()
    })
  })

  describe('moveSliderTo', () => {
    let slider
    let onChange

    beforeEach(() => {
      slider = new Slider('opacity-control')
      onChange = jest.fn()
      slider.checkAndAttach(50, onChange)
      onChange.mockClear()
    })

    it('should clamp the value to the min/max range', () => {
      slider.moveSliderTo(-10)
      expect(document.querySelector('.opacity-slider').getAttribute('aria-valuenow')).toBe('0')

      slider.moveSliderTo(150)
      expect(document.querySelector('.opacity-slider').getAttribute('aria-valuenow')).toBe('100')
    })

    it('should update the displayed value text', () => {
      slider.moveSliderTo(42)

      expect(document.querySelector('.value').textContent).toBe('42')
    })

    it('should call onChange with the new value', () => {
      slider.moveSliderTo(42)

      expect(onChange).toHaveBeenCalledWith('42')
    })

    it('should not throw when there is no onChange callback', () => {
      buildSliderMarkup()
      const sliderWithoutOnChange = new Slider('opacity-control')
      sliderWithoutOnChange.checkAndAttach(0, undefined)

      expect(() => sliderWithoutOnChange.moveSliderTo(42)).not.toThrow()
    })
  })

  describe('getSliderPositionForKey', () => {
    let slider

    beforeEach(() => {
      slider = new Slider('opacity-control')
    })

    it.each([
      ['ArrowLeft', 50, 45],
      ['Left', 50, 45],
      ['ArrowDown', 50, 45],
      ['Down', 50, 45],
      ['ArrowRight', 50, 55],
      ['Right', 50, 55],
      ['ArrowUp', 50, 55],
      ['Up', 50, 55],
      ['PageDown', 50, 40],
      ['PageUp', 50, 60],
      ['Home', 50, 0],
      ['End', 50, 100]
    ])('should map %s to %i from a value of %i', (key, valueNow, expected) => {
      expect(slider.getSliderPositionForKey(key, valueNow)).toBe(expected)
    })

    it('should return null for unrecognised keys', () => {
      expect(slider.getSliderPositionForKey('Tab', 50)).toBeNull()
    })
  })

  describe('onSliderKeyDown', () => {
    let slider

    beforeEach(() => {
      slider = new Slider('opacity-control')
      slider.checkAndAttach(50, jest.fn())
    })

    it('should move the slider and stop the event for a recognised key', () => {
      const event = { key: 'ArrowRight', preventDefault: jest.fn(), stopPropagation: jest.fn() }

      slider.onSliderKeyDown(event)

      expect(document.querySelector('.opacity-slider').getAttribute('aria-valuenow')).toBe('55')
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('should do nothing for an unrecognised key', () => {
      const event = { key: 'Tab', preventDefault: jest.fn(), stopPropagation: jest.fn() }

      slider.onSliderKeyDown(event)

      expect(event.preventDefault).not.toHaveBeenCalled()
      expect(event.stopPropagation).not.toHaveBeenCalled()
    })
  })

  describe('onThumbPointerDown / onThumbPointerUp', () => {
    it('should track the active slider and focus it on pointer down', () => {
      const slider = new Slider('opacity-control')
      slider.checkAndAttach(50, jest.fn())
      const sliderNode = document.querySelector('.opacity-slider')
      jest.spyOn(sliderNode, 'focus')
      const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() }

      slider.onThumbPointerDown(event)

      expect(slider.pointerSlider).toBe(slider.slider)
      expect(sliderNode.focus).toHaveBeenCalled()
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should clear the active slider on pointer up', () => {
      const slider = new Slider('opacity-control')
      slider.checkAndAttach(50, jest.fn())
      slider.pointerSlider = slider.slider

      slider.onThumbPointerUp()

      expect(slider.pointerSlider).toBe(false)
    })
  })

  describe('onRailClick', () => {
    it('should move the slider based on the click position and focus it', () => {
      const slider = new Slider('opacity-control')
      const onChange = jest.fn()
      slider.checkAndAttach(0, onChange)
      const sliderNode = document.querySelector('.opacity-slider')
      jest.spyOn(sliderNode, 'focus')
      const event = { clientX: 15 + 112.5, clientY: 0, preventDefault: jest.fn(), stopPropagation: jest.fn() }

      slider.onRailClick(event)

      expect(sliderNode.getAttribute('aria-valuenow')).toBe('50')
      expect(sliderNode.focus).toHaveBeenCalled()
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('onThumbPointerMove', () => {
    it('should move the slider while the pointer is down over the slider', () => {
      const slider = new Slider('opacity-control')
      slider.checkAndAttach(0, jest.fn())
      slider.pointerSlider = slider.slider
      const sliderNode = document.querySelector('.opacity-slider')
      const event = { clientX: 15 + 112.5, clientY: 0, target: sliderNode, preventDefault: jest.fn(), stopPropagation: jest.fn() }

      slider.onThumbPointerMove(event)

      expect(sliderNode.getAttribute('aria-valuenow')).toBe('50')
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should do nothing when there is no active pointer slider', () => {
      const slider = new Slider('opacity-control')
      slider.checkAndAttach(0, jest.fn())
      const sliderNode = document.querySelector('.opacity-slider')
      const event = { clientX: 0, clientY: 0, target: sliderNode, preventDefault: jest.fn(), stopPropagation: jest.fn() }

      slider.onThumbPointerMove(event)

      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('should do nothing when the pointer event target is outside the active slider', () => {
      const slider = new Slider('opacity-control')
      slider.checkAndAttach(0, jest.fn())
      slider.pointerSlider = slider.slider
      const outsideTarget = document.createElement('div')
      const event = { clientX: 0, clientY: 0, target: outsideTarget, preventDefault: jest.fn(), stopPropagation: jest.fn() }

      slider.onThumbPointerMove(event)

      expect(event.preventDefault).not.toHaveBeenCalled()
    })
  })
})
