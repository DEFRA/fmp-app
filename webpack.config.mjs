import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import dotenv from 'dotenv'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, './.env'), quiet: true })

console.log('Building interactive-map as an npm package', new Date().toLocaleTimeString(), '\n')

export default {
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
    ],
    'upload-shape-file': [
      path.join(__dirname, 'client/js/upload-file/upload-file-client.js')
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
      chunks: () => false
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
      // Redirect react imports to preact/compat so the dev build is consistent
      // with the ESM dist, which externalises preact and aliases react at build time.
      // Without this, the ESM dist chunks run on preact while the rest of the app
      // runs on React — two incompatible reconcilers sharing one component tree.
      react: path.resolve(__dirname, 'node_modules/preact/compat'),
      'react-dom/client': path.resolve(__dirname, 'node_modules/preact/compat/client'),
      'react-dom': path.resolve(__dirname, 'node_modules/preact/compat'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/preact/jsx-runtime'),
      '/assets': path.resolve(__dirname, 'node_modules/govuk-frontend/dist/govuk/assets')
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
