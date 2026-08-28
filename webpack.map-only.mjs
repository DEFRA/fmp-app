import path from 'path'
import dotenv from 'dotenv'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, './.env'), quiet: true })

console.log('Building interactive-map ONLY', new Date().toLocaleTimeString(), '\n')

export default {
  entry: {
    map: [
      path.join(__dirname, 'client/js/map/index.js'),
      path.join(__dirname, 'client/sass/map/index.scss')
    ],
    // 'upload-shape-file': [
    //   path.join(__dirname, 'client/js/upload-file/upload-file-client.js')
    // ]
  },
  // devtool: 'source-map',
  mode: 'development',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'server/public/build-map')
  },
  optimization: {
    splitChunks: {
      chunks () {
        return false
      }
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new webpack.NormalModuleReplacementPlugin(
      /js\/provider\/os-maplibre\/provider\.js/,
      './js/provider/esri-sdk/provider.js'
    )
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.s?css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
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
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js'],
    alias: {
      '/assets': path.resolve(__dirname, 'node_modules/govuk-frontend/dist/govuk/assets'),
      '/@arcgis-path': '@arcgis'
    }
  },
  ignoreWarnings: [
    {
      /* ignore scss warnings for now */
      module: /\.scss/
    }
  ],
  target: ['web', 'es5'],
  performance: {
    // hints: false,
    maxEntrypointSize: 2048000,
    maxAssetSize: 2048000
  }
}
