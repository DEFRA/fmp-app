import { scaleBarPlugin } from './scale-bar/scale-bar.js'
import { searchPlugin } from './search/search.js'
import { mapKeyPlugin } from './map-key/map-key.js'
import { menuPlugin } from './menu/menu.js'
import { interactPlugin } from './interact/interact.js'
import { mapStylePlugin } from './map-styles/map-styles.js'
import { initialiseDatasetsPlugin } from './datasets/datasetsPlugin.js'
import { opacitySliderPlugin } from './opacity-slider/opacity-slider.js'
import { drawPlugin, framePlugin } from './draw/drawPlugin.js'

export const plugins = {}
const pluginArray = []

export const initialisePlugins = (defraMapConfig) => {
  plugins.datasets = initialiseDatasetsPlugin(defraMapConfig)
  plugins.opacitySlider = opacitySliderPlugin(plugins.datasets)
  plugins.mapKey = mapKeyPlugin
  plugins.menu = menuPlugin
  plugins.mapStyle = mapStylePlugin(defraMapConfig.OS_ACCOUNT_NUMBER)
  plugins.scaleBar = scaleBarPlugin()
  plugins.search = searchPlugin(defraMapConfig)
  plugins.draw = drawPlugin
  plugins.frame = framePlugin
  plugins.interact = interactPlugin

  pluginArray.push(
    plugins.datasets,
    plugins.opacitySlider,
    plugins.mapKey,
    plugins.menu,
    plugins.mapStyle,
    plugins.scaleBar,
    plugins.search,
    plugins.draw,
    plugins.frame,
    plugins.interact
  )

  // Ensure each Plugin has a reference to all the other plugins
  pluginArray.forEach(plugin => (plugin.plugins = plugins))
  return pluginArray
}

export const attachInteractiveMapToPlugins = (interactiveMap) => {
  pluginArray.forEach(plugin => {
    // Ensure each Plugin has a reference to the interactive map
    plugin.interactiveMap = interactiveMap
    // Call the plugins attach method if it exists
    if (typeof plugin.attach === 'function') {
      plugin.attach(interactiveMap)
    }
  })
}
