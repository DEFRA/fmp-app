// Shared jest.fn()-based mocks for @arcgis/core submodules, used via jest.mock factories:
//   jest.mock('@arcgis/core/Map', () => require('../__test-helpers__/arcgisCoreMocks').Map)
// Re-apply any .mockImplementation()/.mockReturnValue() in your own beforeEach, since
// the global setup calls jest.resetAllMocks() before every test.
module.exports = {
  config: { __esModule: true, default: { apiKey: '', request: { interceptors: [] } } },
  Map: { __esModule: true, default: jest.fn() },
  MapView: { __esModule: true, default: jest.fn() },
  WMTSLayer: { __esModule: true, default: jest.fn() },
  TileInfo: { __esModule: true, default: { create: jest.fn() } },
  Point: { __esModule: true, default: jest.fn() },
  Extent: { __esModule: true, default: jest.fn() },
  GraphicsLayer: { __esModule: true, default: jest.fn() },
  Graphic: { __esModule: true, default: jest.fn() },
  ScaleBar: { __esModule: true, default: jest.fn() },
  reactiveUtils: { when: jest.fn() }
}
