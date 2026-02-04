const lazyLoadModules = async () => Promise.all([
  /* eslint-disable import-x/no-absolute-path */
  import(/* webpackChunkName: "esri-sdk" */ '/@arcgis-path/core/layers/VectorTileLayer.js'),
  import(/* webpackChunkName: "esri-sdk" */ '/@arcgis-path/core/layers/FeatureLayer.js'),
  import(/* webpackChunkName: "esri-sdk" */ '/@arcgis-path/core/layers/GroupLayer.js')
  /* eslint-enable */
]).then(([VectorTileLayer, FeatureLayer, GroupLayer]) => ({
  VectorTileLayer: VectorTileLayer.default,
  FeatureLayer: FeatureLayer.default,
  GroupLayer: GroupLayer.default
}))

export { lazyLoadModules }
