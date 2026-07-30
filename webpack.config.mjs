import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import dotenv from 'dotenv'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, './.env'), quiet: true })

// const exclusions = /node_modules\/(?!@defra*)/
const exclusions = /node_modules/
const floodMapPath = 'node_modules/@defra/flood-map/src/flood-map.js'
const floodMapScssPath = '../../../node_modules/@defra/flood-map/src/flood-map'

const arcGisPackagePath = '@arcgis'

console.log('Building interactive-map as an npm package', new Date().toLocaleTimeString(), '\n')

const config = configBuilder(exclusions, arcGisPackagePath, floodMapPath, floodMapScssPath)
export default config
