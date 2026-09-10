import React, { useState, useEffect } from 'react'
import {
  Slider,
  DEFAULT_MIN_VALUE,
  DEFAULT_MAX_VALUE
} from './slider.js'

const RANGE = 100

// Renders as a control injected into the host panel
export const OpacitySlider = ({ pluginState: { dispatch, ready, value: opacityAsDecimal }, pluginConfig, services: { eventBus } }) => {
  const { heading = 'Layer opacity' } = pluginConfig
  const [opacitySlider, setOpacitySlider] = useState(null)

  const setOpacity = (opacityAsPercentage) =>
    dispatch({ type: 'SET_VALUE', payload: opacityAsPercentage / RANGE })

  // Create a new opacity slider
  useEffect(() =>
    setOpacitySlider(new Slider('opacity-control')),
  [])

  useEffect(() => {
    if (opacitySlider) {
      opacitySlider.checkAndAttach(opacityAsDecimal * RANGE, setOpacity)
    }
  }, [opacitySlider])

  const headingId = 'im-c-slider__heading'

  return (
    <div id='opacity-control' className='im-c-slider opacity-viewer-sliders fm-c-details govuk-body-s'>
      <h3 className='im-e-heading-s im-c-slider__heading' id={headingId}>{heading}</h3>
      <div
        className='opacity-slider'
        role='slider'
        tabIndex='0'
        aria-valuemin={DEFAULT_MIN_VALUE}
        aria-valuenow={opacityAsDecimal * RANGE}
        aria-valuemax={DEFAULT_MAX_VALUE}
        aria-labelledby='opacity-control'
      >
        <svg width='250' height='50' aria-hidden='true'>
          <text className='value' x='170.6640625' y='20'>{opacityAsDecimal} </text>
          <rect className='rail' x='15' y='26' rx='3.5' width='225' height='14' />
          <rect className='fill' x='15' y='26' rx='3.5' width='161.5' height='14' />
          <rect className='thumb' x='173' y='26' rx='3.5' width='14' height='14' />
          <rect className='focus' x='162' y='2' rx='3.5' width='34' height='46' />
        </svg>
      </div>
    </div>
  )
}
