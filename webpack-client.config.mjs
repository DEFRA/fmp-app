import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

export default {
  entry: {
    'check-your-details-map': [
      path.join(__dirname, 'client/js/modules/check-your-details-map.js')
    ]
  },
  devtool: 'source-map',
  mode: 'development',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [],
  resolve: { extensions: ['.js'] },
  target: ['web', 'es5'],
  performance: {
    // hints: false,
    maxEntrypointSize: 2048000,
    maxAssetSize: 2048000
  }
}
