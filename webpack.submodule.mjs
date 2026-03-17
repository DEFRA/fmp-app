import path from 'path'
import { configBuilder } from './webpack.configBuilder.mjs'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const exclusions = /node_modules/
// const exclusions = /node_modules\/(?!@defra*)/
const floodMapPath = 'defra-map/src/flood-map.js'
const floodMapScssPath = '../../../defra-map/src/flood-map'
const arcGisPackagePath = path.resolve(__dirname, 'defra-map/node_modules/@arcgis')
// import InteractiveMap from '@defra/interactive-map'
// import esriProvider from '@defra/interactive-map/providers/esri'

const alias = {
  '@defra/interactive-map': path.resolve(__dirname, 'node_modules/@defra/interactive-map/src'),
  '@defra/interactive-map/providers/esri': path.resolve(__dirname, 'node_modules/@defra/interactive-map/providers/beta/esri/src'),
  '@defra/interactive-map/plugins/map-styles': path.resolve(__dirname, 'node_modules/@defra/interactive-map/plugins/beta/map-styles/src'),
  '@defra/interactive-map/plugins/scale-bar': path.resolve(__dirname, 'node_modules/@defra/interactive-map/plugins/scale-bar/src'),
  '@defra/interactive-map/plugins/search': path.resolve(__dirname, 'node_modules/@defra/interactive-map/plugins/search/src')
}

console.log('Building interactive-map as a submodule', new Date().toLocaleTimeString(), '\n')
const config = configBuilder(exclusions, arcGisPackagePath, floodMapPath, floodMapScssPath, alias)
console.log('config:')
console.dir(config, { depth: null })
export default config
