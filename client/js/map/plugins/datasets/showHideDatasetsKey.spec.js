const mockMapState = { interactiveMap: null }
jest.mock('../../interactive-map-helpers/mapState.js', () => ({
  mapState: mockMapState
}))

const loadShowHideDatasetsKey = () => {
  jest.resetModules()
  return require('./showHideDatasetsKey.js')
}

describe('hideKeyAndSearchButton / showKeyAndSearchButton', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="map-search"></div>
      <div id="map-map-key"></div>
    `
  })

  it('should hide the search and map key buttons', () => {
    const { hideKeyAndSearchButton } = loadShowHideDatasetsKey()

    hideKeyAndSearchButton()

    expect(document.getElementById('map-search').style.display).toBe('none')
    expect(document.getElementById('map-map-key').style.display).toBe('none')
  })

  it('should show the search and map key buttons', () => {
    const { showKeyAndSearchButton } = loadShowHideDatasetsKey()

    showKeyAndSearchButton()

    expect(document.getElementById('map-search').style.display).toBe('flex')
    expect(document.getElementById('map-map-key').style.display).toBe('flex')
  })

  it('should not throw when the buttons are not present', () => {
    document.body.innerHTML = ''
    const { hideKeyAndSearchButton, showKeyAndSearchButton } = loadShowHideDatasetsKey()

    expect(() => hideKeyAndSearchButton()).not.toThrow()
    expect(() => showKeyAndSearchButton()).not.toThrow()
  })
})

describe('hideDatasetsKey / reShowDatasetsKey', () => {
  let hidePanel
  let showPanel

  beforeEach(() => {
    document.body.innerHTML = ''
    hidePanel = jest.fn()
    showPanel = jest.fn()
    mockMapState.interactiveMap = { hidePanel, showPanel }
  })

  it('should warn and do nothing when there is no interactiveMap instance', () => {
    mockMapState.interactiveMap = null
    const { hideDatasetsKey } = loadShowHideDatasetsKey()
    jest.spyOn(console, 'warn').mockImplementation(() => {})

    hideDatasetsKey('some-id')

    expect(console.warn).toHaveBeenCalled()
  })

  it('should hide the mapKey panel when it is currently visible', () => {
    const keyPanel = document.createElement('div')
    keyPanel.id = 'map-panel-map-key'
    keyPanel.checkVisibility = () => true
    document.body.appendChild(keyPanel)
    const { hideDatasetsKey } = loadShowHideDatasetsKey()

    hideDatasetsKey('id-1')

    expect(hidePanel).toHaveBeenCalledWith('mapKey')
  })

  it('should not hide the mapKey panel when it is not currently visible', () => {
    const { hideDatasetsKey } = loadShowHideDatasetsKey()

    hideDatasetsKey('id-1')

    expect(hidePanel).not.toHaveBeenCalled()
  })

  it('should re-show the mapKey panel once the id that hid it re-shows it', () => {
    const keyPanel = document.createElement('div')
    keyPanel.id = 'map-panel-map-key'
    keyPanel.checkVisibility = () => true
    document.body.appendChild(keyPanel)
    const { hideDatasetsKey, reShowDatasetsKey } = loadShowHideDatasetsKey()
    hideDatasetsKey('id-1')

    reShowDatasetsKey('id-1')

    expect(showPanel).toHaveBeenCalledWith('mapKey')
  })

  it('should not re-show the mapKey panel while another id still has it hidden', () => {
    const keyPanel = document.createElement('div')
    keyPanel.id = 'map-panel-map-key'
    keyPanel.checkVisibility = () => true
    document.body.appendChild(keyPanel)
    const { hideDatasetsKey, reShowDatasetsKey } = loadShowHideDatasetsKey()
    hideDatasetsKey('id-1')
    // id-2 is also hidden while the key panel is already hidden by id-1
    hideDatasetsKey('id-2')

    reShowDatasetsKey('id-1')

    expect(showPanel).not.toHaveBeenCalled()

    reShowDatasetsKey('id-2')
    expect(showPanel).toHaveBeenCalledWith('mapKey')
  })

  it('should do nothing when re-showing an id that never hid the key', () => {
    const { reShowDatasetsKey } = loadShowHideDatasetsKey()

    reShowDatasetsKey('never-hidden')

    expect(showPanel).not.toHaveBeenCalled()
  })
})
