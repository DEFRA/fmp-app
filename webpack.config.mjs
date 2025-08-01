import path from 'path'
import dotenv from 'dotenv'
import { configBuilder } from './webpack.configBuilder.mjs'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, './.env') })

const exclusions = /node_modules\/(?!@defra*)/
const floodMapPath = 'node_modules/@defra/flood-map/src/flood-map.js'

const arcGisPackagePath = '@arcgis'

console.log('Building defra-map as an npm package\n')

const config = configBuilder(exclusions, arcGisPackagePath, floodMapPath)
export default config
