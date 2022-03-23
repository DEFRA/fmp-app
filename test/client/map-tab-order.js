const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
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

  lab.afterEach(async () => { sinon.restore() })

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

  lab.test('setTabActions should not call anything when shift+tab is pressed and previousElement is not defined', async () => {
    const element = new ElementConstructor()

    setTabActions(element, nextElement, undefined)
    element.listeners.keydown({ which: 9, shiftKey: true, preventDefault })
    Code.expect(nextElementFocus.callCount, 'nextElementFocus.callCount').to.equal(0)
    Code.expect(previousElementFocus.callCount, 'previousElementFocus.callCount').to.equal(0)
    Code.expect(preventDefault.callCount, 'preventDefault.callCount').to.equal(0)
  })

  lab.test('setTabActions should not call anything when tab is pressed and nextElement is not defined', async () => {
    const element = new ElementConstructor()

    setTabActions(element, undefined, previousElement)
    element.listeners.keydown({ which: 9, shiftKey: false, preventDefault })
    Code.expect(nextElementFocus.callCount, 'nextElementFocus.callCount').to.equal(0)
    Code.expect(previousElementFocus.callCount, 'previousElementFocus.callCount').to.equal(0)
    Code.expect(preventDefault.callCount, 'preventDefault.callCount').to.equal(0)
  })
})

lab.experiment('map-tab-order', () => {
  let querySelector
  let querySelectorAll
  let addEventListener
  let hasAttribute
  let getAttribute

  lab.beforeEach(async () => {
    querySelector = sinon.stub()
    querySelectorAll = sinon.stub().returns([])
    addEventListener = sinon.stub()
    hasAttribute = sinon.stub().returns(false)
    getAttribute = sinon.stub().returns(false)
  })

  lab.afterEach(async () => { sinon.restore() })

  lab.test('fixMapTabOrder', async () => {
    querySelector.returns({ querySelector, querySelectorAll, addEventListener, hasAttribute, getAttribute })
    const mockDocument = { querySelector, querySelectorAll }
    fixMapTabOrder(mockDocument)
    Code.expect(1).to.equal(1)
    sinon.restore()
  })
})
