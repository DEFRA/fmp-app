// Shared jest.fn()-based mocks for @defra/interactive-map and its subpaths, used via:
//   jest.mock('@defra/interactive-map', () => require('../__test-helpers__/interactiveMapMocks').interactiveMap)
// Some @defra/interactive-map subpaths (e.g. providers/esri, plugins/datasets) only
// have an "import" export condition, so they must be mocked with { virtual: true }.
module.exports = {
  interactiveMap: { __esModule: true, default: jest.fn() },
  esriProvider: { __esModule: true, default: jest.fn() },
  datasetsPlugin: { __esModule: true, default: jest.fn() }
}
