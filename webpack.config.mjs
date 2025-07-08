import path from 'path'
import dotenv from 'dotenv'
import { configBuilder } from './webpack.configBuilder.mjs'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, './.env') })

const buildAsSubmodule = process.env.build_map_as_submodule === 'true'

const exclusions = buildAsSubmodule ? /node_modules/ : /node_modules\/(?!@defra*)/

const floodMapPath = buildAsSubmodule
  ? 'defra-map/src/flood-map.js'
  : 'node_modules/@defra/flood-map/src/flood-map.js'

const arcGisPackagePath = buildAsSubmodule
  ? path.resolve(__dirname, 'defra-map/node_modules/@arcgis')
  : '@arcgis'

console.log('Building defra-map as', buildAsSubmodule ? 'a submodule' : 'an npm package', '\n')

const config = configBuilder(exclusions, arcGisPackagePath, floodMapPath)
export default config
