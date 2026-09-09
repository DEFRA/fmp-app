import React, { useState, useEffect } from 'react'
import { Slider } from './slider.js'

const DEFAULT_OPACITY = 75

// Renders as a control injected into the host panel
export const OpacitySlider = ({ pluginConfig, services: { eventBus } }) => {
  const { heading = 'Layer opacity', onChange } = pluginConfig
  const [opacitySlider, setOpacitySlider] = useState(null)
  const [opacity, setOpacity] = useState(DEFAULT_OPACITY)
  const [ready, setReady] = useState(false)

  const onReady = () => setReady(true)

  useEffect(() => {
    setOpacitySlider(new Slider('opacity-control'))
    eventBus.on('datasets:ready', onReady)

    return () => {
      eventBus.off('datasets:ready', onReady)
    }
  }, [])

  useEffect(() => {
    if (ready && opacitySlider) {
      opacitySlider.checkAndAttach(opacity, setOpacity)
    }
  }, [opacitySlider, ready])

  useEffect(() => {
    if (ready && opacitySlider) {
      onChange(opacity / opacitySlider.range)
    }
  }, [ready, opacity])

  const headingId = 'flood-c-draw-menu__heading'

  return (
    <div id='opacity-control' className='flood-c-draw-menu opacity-viewer-sliders fm-c-details govuk-body-s'>
      <h3 className='im-e-heading-s flood-c-draw-menu__heading' id={headingId}>{heading}</h3>
      <div className='opacity-slider' role='slider' tabIndex='0' aria-valuemin='0' aria-valuenow='75' aria-valuemax='100' aria-labelledby='opacity-control'>
        <svg width='250' height='50' aria-hidden='true'>
          <text className='value' x='170.6640625' y='20'>{opacity} </text>
          <rect className='rail' x='15' y='26' rx='3.5' width='225' height='14' />
          <rect className='fill' x='15' y='26' rx='3.5' width='161.5' height='14' />
          <rect className='thumb' x='173' y='26' rx='3.5' width='14' height='14' />
          <rect className='focus' x='162' y='2' rx='3.5' width='34' height='46' />
        </svg>
      </div>
    </div>
  )
}
