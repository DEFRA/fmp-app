const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const { fixMapTabOrder, setTabActions } = require('../../client/js/map-tab-order')
const sinon = require('sinon')

function ElementConstructor (hasAttributeResult = false, getAttributeResult = false, closestResult = false) {
  this.listeners = {}
  this.addEventListener = (type, callback) => {
    this.listeners[type] = callback
  }
  this.hasAttribute = () => hasAttributeResult
  this.getAttribute = () => getAttributeResult
  this.closest = () => closestResult
}

lab.experiment('setTabActions', () => {
  let nextElementFocus
  let previousElementFocus
  let preventDefault
  let nextElement
  let previousElement

  lab.beforeEach(async () => {
    nextElementFocus = sinon.stub()
    previousElementFocus = sinon.stub()
    preventDefault = sinon.stub()
    nextElement = { focus: nextElementFocus }
    previousElement = { focus: previousElementFocus }
  })

  lab.afterEach(async () => {
    sinon.restore()
  })

  lab.test('setTabActions should call nextElement.focus when tab is pressed', async () => {
    const element = new ElementConstructor()

    setTabActions(element, nextElement, previousElement)
    element.listeners.keydown({ which: 9, shiftKey: false, preventDefault })
    Code.expect(nextElementFocus.callCount, 'nextElementFocus.callCount').to.equal(1)
    Code.expect(previousElementFocus.callCount, 'previousElementFocus.callCount').to.equal(0)
    Code.expect(preventDefault.callCount, 'preventDefault.callCount').to.equal(1)
  })

  lab.test('setTabActions should call previousElement.focus when shift+tab is pressed', async () => {
    const element = new ElementConstructor()

    setTabActions(element, nextElement, previousElement)
    element.listeners.keydown({ which: 9, shiftKey: true, preventDefault })
    Code.expect(nextElementFocus.callCount, 'nextElementFocus.callCount').to.equal(0)
    Code.expect(previousElementFocus.callCount, 'previousElementFocus.callCount').to.equal(1)
    Code.expect(preventDefault.callCount, 'preventDefault.callCount').to.equal(1)
  })

  lab.test('setTabActions should not call anything when tab is not pressed', async () => {
    const element = new ElementConstructor()

    setTabActions(element, nextElement, previousElement)
    element.listeners.keydown({ which: 10 })
    Code.expect(nextElementFocus.callCount, 'nextElementFocus.callCount').to.equal(0)
    Code.expect(previousElementFocus.callCount, 'previousElementFocus.callCount').to.equal(0)
    Code.expect(preventDefault.callCount, 'preventDefault.callCount').to.equal(0)
  })

  lab.test(
    'setTabActions should not call anything when shift+tab is pressed and previousElement is not defined',
    async () => {
      const element = new ElementConstructor()

      setTabActions(element, nextElement, undefined)
      element.listeners.keydown({ which: 9, shiftKey: true, preventDefault })
      Code.expect(nextElementFocus.callCount, 'nextElementFocus.callCount').to.equal(0)
      Code.expect(previousElementFocus.callCount, 'previousElementFocus.callCount').to.equal(0)
      Code.expect(preventDefault.callCount, 'preventDefault.callCount').to.equal(0)
    }
  )

  lab.test('setTabActions should not call anything when tab is pressed and nextElement is not defined', async () => {
    const element = new ElementConstructor()

    setTabActions(element, undefined, previousElement)
    element.listeners.keydown({ which: 9, shiftKey: false, preventDefault })
    Code.expect(nextElementFocus.callCount, 'nextElementFocus.callCount').to.equal(0)
    Code.expect(previousElementFocus.callCount, 'previousElementFocus.callCount').to.equal(0)
    Code.expect(preventDefault.callCount, 'preventDefault.callCount').to.equal(0)
  })
})

lab.experiment('fixMapTabOrder', () => {
  let querySelector
  let querySelectorAll
  let addEventListener
  let hasAttribute
  let getAttribute

  let elementBeforeFigure1
  let elementBeforeFigure2
  let hiddenElement
  let disabledElement
  let zoomInElement
  let zoomOutElement
  let osTermsElement
  let fullScreenElement
  let elementAfterFigure1
  let elementAfterFigure2
  let figureElement

  let documentElements

  lab.beforeEach(async () => {
    // ElementConstructor (hasAttributeResult = false, getAttributeResult = false, closestResult = false) {
    elementBeforeFigure1 = new ElementConstructor(false, false, false)
    elementBeforeFigure2 = new ElementConstructor(false, false, false)
    hiddenElement = new ElementConstructor(false, true, false)
    disabledElement = new ElementConstructor(true, false, false)
    zoomInElement = new ElementConstructor(false, false, true)
    zoomOutElement = new ElementConstructor(false, false, true)
    osTermsElement = new ElementConstructor(false, false, true)
    fullScreenElement = new ElementConstructor(false, false, true)
    elementAfterFigure1 = new ElementConstructor(false, false, false)
    elementAfterFigure2 = new ElementConstructor(false, false, false)
    figureElement = new ElementConstructor(false, false, false)

    documentElements = [
      elementBeforeFigure1,
      elementBeforeFigure2,
      hiddenElement,
      disabledElement,
      zoomInElement,
      zoomOutElement,
      osTermsElement,
      fullScreenElement,
      elementAfterFigure1,
      elementAfterFigure2
    ]

    querySelector = sinon.stub()
    querySelectorAll = sinon.stub().returns([])
    addEventListener = sinon.stub()
    hasAttribute = sinon.stub().returns(false)
    getAttribute = sinon.stub().returns(false)
    documentElements.forEach((element) => {
      element.querySelector = querySelector
      element.querySelectorAll = querySelectorAll
      element.addEventListener = addEventListener
    })
    figureElement.querySelector = querySelector
    figureElement.querySelectorAll = querySelectorAll
    figureElement.addEventListener = addEventListener
  })

  lab.afterEach(async () => {
    sinon.restore()
  })

  lab.test('fixMapTabOrder should call querySelectorAll on document ', async () => {
    querySelector.returns({ querySelector, querySelectorAll, addEventListener, hasAttribute, getAttribute })
    const mockDocument = { querySelector, querySelectorAll }
    fixMapTabOrder(mockDocument)
    Code.expect(querySelector.callCount, 'querySelector should be called once').to.equal(5)
    Code.expect(querySelectorAll.callCount, 'querySelectorAll should be called once').to.equal(1)
    sinon.restore()
  })

  lab.test('fixMapTabOrder should set tabIndex to -1 on osTermsElement and attributionsElement ', async () => {
    querySelectorAll.returns(documentElements)
    querySelector.withArgs('figure.map-container').returns(figureElement)
    querySelector.withArgs('.ol-zoom-in').returns(zoomInElement)
    querySelector.withArgs('.ol-zoom-out').returns(zoomOutElement)
    querySelector.withArgs('a[href$="os-terms"]').returns(osTermsElement)
    querySelector.withArgs('.ol-full-screen-false').returns(fullScreenElement)

    const mockDocument = { querySelector, querySelectorAll }
    fixMapTabOrder(mockDocument)
    Code.expect(querySelector.callCount, 'querySelector should be called once').to.equal(5)
    Code.expect(querySelectorAll.callCount, 'querySelectorAll should be called once').to.equal(1)
    Code.expect(osTermsElement.tabIndex, 'osTermsElement.tabIndex should be -1').to.equal('-1')
    Code.expect(fullScreenElement.tabIndex, 'fullScreenElement.tabIndex should be -1').to.equal('-1')
    sinon.restore()
  })

  lab.test(
    'fixMapTabOrder should not set tabIndex to -1 on osTermsElement and attributionsElement if figure is missing',
    async () => {
      querySelectorAll.returns(documentElements)
      querySelector.returns(undefined)

      const mockDocument = { querySelector, querySelectorAll }
      fixMapTabOrder(mockDocument)
      Code.expect(querySelector.callCount, 'querySelector should be called once').to.equal(1)
      Code.expect(querySelectorAll.callCount, 'querySelectorAll should be called once').to.equal(1)
      Code.expect(osTermsElement.tabIndex, 'osTermsElement.tabIndex should be undefined').to.equal(undefined)
      Code.expect(fullScreenElement.tabIndex, 'fullScreenElement.tabIndex should be undefined').to.equal(undefined)
      sinon.restore()
    }
  )
})
