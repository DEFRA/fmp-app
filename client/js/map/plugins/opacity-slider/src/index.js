import './opacity-slider.scss'
import { manifest } from './manifest.js'
const createPlugin = (options = {}) => {
  return {
    ...options,
    id: 'opacity-slider',
    load: async () => {
      const module = manifest
      return module
    }
  }
}

export default createPlugin
