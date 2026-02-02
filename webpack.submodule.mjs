import path from 'path'
import { configBuilder } from './webpack.configBuilder.mjs'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const exclusions = /node_modules/
const floodMapPath = 'defra-map/src/flood-map.js'
const floodMapScssPath = '../../../defra-map/src/flood-map'
const arcGisPackagePath = path.resolve(__dirname, 'defra-map/node_modules/@arcgis')
console.log('Building defra-map as a submodule\n')
const config = configBuilder(exclusions, arcGisPackagePath, floodMapPath, floodMapScssPath)
export default config
