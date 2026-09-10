import { useEffect } from 'react'

export const OpacitySliderInit = ({
  pluginConfig,
  pluginState: {
    dispatch,
    ready,
    value: opacity
  },
  services: { eventBus }
}) => {
  const { onChange } = pluginConfig
  const onDatasetsReady = () => dispatch({ type: 'SET_READY' })

  useEffect(() => {
    eventBus.on('datasets:ready', onDatasetsReady)
    return () => {
      eventBus.off('datasets:ready', onDatasetsReady)
    }
  }, [])

  useEffect(() => {
    if (ready) {
      onChange(opacity)
    }
  }, [ready, opacity])
}
