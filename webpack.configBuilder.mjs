import path from 'path'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
const __dirname = path.dirname(new URL(import.meta.url).pathname)

const configBuilder = (exclusions, arcGisPackagePath, floodMapPath) => ({
  entry: {
    application: [
      path.join(__dirname, 'client/sass/application.scss')
    ],
    map: [
      path.join(__dirname, 'client/js/map/index.js'),
      path.join(__dirname, 'client/sass/map/index.scss')
    ],
    'check-your-details': [
      path.join(__dirname, 'client/js/check-your-details/index.js'),
      path.join(__dirname, 'client/sass/check-your-details/index.scss')
    ],
    core: [
      path.join(__dirname, 'client/js/core.js')
    ],
    'product-1-spinner': [
      path.join(__dirname, 'client/js/modules/product-1-spinner.js')
    ]
  },
  devtool: 'source-map',
  mode: 'development',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'server/public/build')
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
        exclude: exclusions,
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
})

export { configBuilder }
