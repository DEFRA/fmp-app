import './opacity-slider.scss'
import { manifest } from './manifest.js'
const createPlugin = (options = {}) => {
  return {
    ...options,
    id: 'floodMenu',
    load: async () => {
      const module = manifest
      return module
    }
  }
}

export default createPlugin
