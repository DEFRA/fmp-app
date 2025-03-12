import webpack from 'webpack'
import path from 'path'
import dotenv from 'dotenv'

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

export default {
  entry: {
    main: path.join(__dirname, 'client/js/defra-map/index.js'),
    'check-your-details-map': path.join(__dirname, 'client/js/modules/check-your-details-map.js'),
    core: [path.join(__dirname, 'client/js/core.js')],
    'product-1-spinner': path.join(__dirname, 'client/js/modules/product-1-spinner.js')
  },
  devtool: 'source-map',
  mode: 'development',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    splitChunks: {
      chunks () {
        return false
      }
    }
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /js\/provider\/os-maplibre\/provider\.js/,
      './js/provider/esri-sdk/provider.js'
    )
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: exclusions,
        loader: 'babel-loader'
      },
      { // Not Required anymore as the svgs are embedded inline
        test: /\.(jpg|png)$/,
        use: {
          loader: 'url-loader'
        }
      },
      {
        test: /\.jsx?$/,
        use: ['magic-comments-loader'],
        exclude: exclusions
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js'],
    alias: {
      '/assets': path.resolve(__dirname, 'node_modules/govuk-frontend/dist/govuk/assets'),
      '/flood-map': path.resolve(__dirname, floodMapPath),
      '/@arcgis-path': arcGisPackagePath
    }
  },
  target: ['web', 'es5'],
  performance: {
    // hints: false,
    maxEntrypointSize: 2048000,
    maxAssetSize: 2048000
  }
}
