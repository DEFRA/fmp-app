import _createOpacitySliderPlugin from './src/index.js'
import { terms } from '../../terms.js'

export const opacitySliderPlugin = (datasetsPlugin) => _createOpacitySliderPlugin({
  heading: terms.labels.opacityHeading,
  onChange: (opacity) => datasetsPlugin.setOpacity(opacity)
})
