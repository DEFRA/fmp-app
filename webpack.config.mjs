import webpack from 'webpack'
import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import dotenv from 'dotenv'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, './.env') })

export default {
  entry: {
    main: [
      path.join(__dirname, 'client/js/defra-map/index.js'),
      path.join(__dirname, 'client/sass-flood-map/main.scss')
    ]
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
        exclude: /node_modules\/(?!@defra*)/,
        loader: 'babel-loader'
      },
      { // I need to include the css from defra-map
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
        exclude: /node_modules\/(?!@defra*)/
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js'],
    alias: {
      '/assets': path.resolve(__dirname, 'node_modules/govuk-frontend/dist/govuk/assets')
    }
  },
  ignoreWarnings: [
    {
      /* ignore scss warnings for now */
      module: /main\.scss/
    }
  ],
  target: ['web', 'es5'],
  performance: {
    // hints: false,
    maxEntrypointSize: 2048000,
    maxAssetSize: 2048000
  }
}
