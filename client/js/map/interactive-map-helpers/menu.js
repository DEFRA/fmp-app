import { getQueryParam, setQueryParam } from './queryParams'
import { sliderMarkUp } from '../slider/index.js'
import { terms } from '../terms'

/* ==========================================================================
   Menu utilities
   ========================================================================== */

/* -------------------------------
   Menu button configuration
-------------------------------- */

const menuItems = [{
  id: 'shape-btn',
  label: 'Draw shape',
  disabled: feature => !!feature,
  svg: `
    <path d="M19.5 7v10M4.5 7v10M7 19.5h10M7 4.5h10"/>
    <path d="M22 18v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zm0-15v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zM7 18v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zM7 3v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1z"/>
  `
}, {
  id: 'square-btn',
  label: 'Draw square',
  disabled: feature => !!feature,
  svg: '<rect width="18" height="18" x="3" y="3" rx="2"/>'
}, {
  id: 'edit-btn',
  label: 'Edit area',
  disabled: feature => !feature,
  svg: `
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
    <path d="m15 5 4 4"/>
  `
}, {
  id: 'delete-btn',
  label: 'Delete area',
  disabled: feature => !feature,
  svg: `
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
    <path d="M3 6h18"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  `
}]

/* -------------------------------
   Dataset configuration
-------------------------------- */

const datasetsConfig = [{
  type: 'radios',
  legend: 'Datasets',
  name: 'datasets',
  items: [
    { id: 'floodzones', value: 'floodzones', label: 'Flood zones 2 and 3', formGroups: ['datasets', 'scenario'] },
    { id: 'surfacewater', value: 'surfacewater', label: 'Surface water', formGroups: ['datasets', 'scenario', 'likelihood', 'depth'] },
    { id: 'none', value: 'none', label: 'None', formGroups: ['datasets'] }
  ]
}, {
  type: 'radios',
  legend: 'Climate change',
  name: 'scenario',
  items: [
    { id: 'presentday', value: 'presentday', label: terms.labels.presentDay },
    { id: 'climatechange', value: 'climatechange', label: terms.labels.floodZoneClimateChange }
  ]
}, {
  type: 'radios',
  legend: 'Annual likelihood of flooding',
  name: 'likelihood',
  items: [
    { id: 'high', value: 'high', label: terms.chance.swHigh },
    { id: 'medium', value: 'medium', label: terms.chance.swMedium, default: true }, // set default: true if the 1st item is not the default
    { id: 'low', value: 'low', label: terms.chance.swLow }
  ]
}, {
  type: 'radios',
  legend: 'Depth of flooding',
  name: 'depth',
  items: [
    { id: 'depthAll', value: 'depthAll', label: terms.depth.depthAll },
    { id: 'depth150', value: 'depth150', label: terms.depth.extentsFull },
    { id: 'depth300', value: 'depth300', label: terms.depth.extentsOver150 },
    { id: 'depth600', value: 'depth600', label: terms.depth.extentsOver300 },
    { id: 'depth900', value: 'depth900', label: terms.depth.extentsOver600 },
    { id: 'depth1200', value: 'depth1200', label: terms.depth.extentsOver900 },
    { id: 'depth2300', value: 'depth2300', label: terms.depth.extentsOver1200 },
    { id: 'depthOver2300', value: 'depthOver2300', label: terms.depth.extentsOver2300 },

  ]
}, {
  type: 'checkboxes',
  legend: 'Map features',
  name: 'mapFeatures',
  items: [
    { id: 'waterstorage', value: 'waterstorage', label: terms.labels.waterStorage },
    { id: 'flooddefence', value: 'flooddefence', label: terms.labels.floodDefence },
    { id: 'mainrivers', value: 'mainrivers', label: terms.labels.mainRivers }
  ]
}]

/* -------------------------------
   Menu button handlers
-------------------------------- */

function isEnabled (button) {
  return button.getAttribute('aria-disabled') !== 'true'
}

function toggleButtonState (enabledButtons) {
  const buttons = document.querySelectorAll('.fmp-menu-button')
  buttons.forEach(button => {
    const key = button.id.slice(0, -4)
    button.setAttribute('aria-disabled', !enabledButtons.includes(key))
  })
}

function addMenuClickHandlers ({ onDrawShape, onDrawFrame, onEdit, onDelete }) {
  document.addEventListener('click', e => {
    const shapeBtn = e.target.closest('#shape-btn')
    const squareBtn = e.target.closest('#square-btn')
    const editBtn = e.target.closest('#edit-btn')
    const deleteBtn = e.target.closest('#delete-btn')

    if (shapeBtn && isEnabled(shapeBtn)) {
      toggleButtonState([])
      onDrawShape?.()
      return
    }
    if (squareBtn && isEnabled(squareBtn)) {
      toggleButtonState([])
      onDrawFrame?.()
      return
    }
    if (editBtn && isEnabled(editBtn)) {
      toggleButtonState([])
      onEdit?.()
      return
    }
    if (deleteBtn && isEnabled(deleteBtn)) {
      onDelete?.()
      toggleButtonState(['shape', 'square'])
    }
  })
}

/* -------------------------------
   Dataset change handler
-------------------------------- */

function addDatasetChangeHandler () {
  function toggleFormGroupVisibility (activeFormGroups) {
    if (!activeFormGroups) {
      return
    }

    const allFormGroups = Array.from(document.querySelectorAll('.fmp-datasets .govuk-form-group[data-name]'))

    allFormGroups.forEach(function (fg) {
      const isFormGroupVisible = fg.style.display !== 'none'

      // Show fieldset and check first radio
      if (activeFormGroups.includes(fg.dataset.name) && !isFormGroupVisible) {
        fg.style.display = 'block'
        const firstRadio = fg.querySelector('input[type="radio"].default-radio') || fg.querySelector('input[type="radio"]')
        if (firstRadio) {
          firstRadio.checked = true
        }
      }

      // Hide fieldset and uncheck all radios
      if (!activeFormGroups.includes(fg.dataset.name) && isFormGroupVisible) {
        fg.style.display = 'none'
        const radios = fg.querySelectorAll('input[type="radio"]')
        radios.forEach(radio => (radio.checked = false))
      }
    })
  }

  function update (e) {
    // Radio change
    if (e.target.classList.contains('govuk-radios__input') && e.target.closest('.fmp-datasets')) {
      const radio = e.target
      const datasetName = radio.closest('.govuk-form-group').dataset.name
      const dataSet = datasetsConfig.find(ds => ds.name === datasetName)
      const activeFormGroups = dataSet.items.find(item => item.id === radio.id).formGroups

      toggleFormGroupVisibility(activeFormGroups)

      const checkedIds = Array.from(document.querySelectorAll('.fmp-datasets input[type="radio"]')).filter(r => r.checked).map(r => r.value)

      const dataset = checkedIds.join('-')
      setQueryParam('dataset', dataset)

      const event = new CustomEvent('fmp:datasetchanged', {
        detail: { dataset }
      })
      document.dispatchEvent(event)
    }

    // Checkbox change
    if (e.target.classList.contains('govuk-checkboxes__input') && e.target.closest('.fmp-datasets')) {
      const checkedIds = Array.from(document.querySelectorAll('.fmp-datasets input[type="checkbox"]')).filter(cb => cb.checked).map(cb => cb.id)

      const mapFeatures = checkedIds.join(',')
      setQueryParam('features', mapFeatures)

      const event = new CustomEvent('fmp:featureschanged', {
        detail: { mapFeatures }
      })
      document.dispatchEvent(event)
    }
  }

  document.addEventListener('change', update)
}

/* -------------------------------
   Query parsing
-------------------------------- */

function parseDatasetQuery (value) {
  return value.split('-').filter(Boolean)
}

const datasetQuery = getQueryParam('dataset', 'floodzones-presentday')
const datasetState = parseDatasetQuery(datasetQuery)

const featuresQuery = getQueryParam('features', '')
const featureState = featuresQuery ? featuresQuery.split(',').filter(Boolean) : []

/* -------------------------------
   Render helpers
-------------------------------- */

function hideMenu (interactiveMap) {
  const menu = document.querySelector('#map-panel-menu')
  if (menu?.getAttribute('aria-modal') === 'true') {
    interactiveMap.hidePanel('menu')
  }
}

function renderMenu (feature) {
  return `
    <div class="fmp-menu">
      <h3 class="govuk-heading-s" id="boundary-heading">
        Get a boundary report
      </h3>
      <ul class="fmp-menu-list" aria-labelledby="boundary-heading" role="menu">
        ${menuItems.map(item => `
          <li class="fmp-menu-item" role="presentation">
            <button
              id="${item.id}"
              class="govuk-body-s fmp-menu-button"
              aria-disabled="${item.disabled(feature)}"
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                   width="24" height="24"
                   viewBox="0 0 24 24"
                   fill="none"
                   stroke="currentColor"
                   stroke-width="2"
                   stroke-linecap="round"
                   stroke-linejoin="round"
                   aria-hidden="true"
                   focusable="false">
                ${item.svg}
              </svg>
              <span class="fmp-menu-button__label">${item.label}</span>
            </button>
          </li>
        `).join('')}
      </ul>
    </div>
  `
}

function renderRadios ({ legend, name, items, visible, checkedValue }) {
  return `
    <div class="govuk-form-group" ${visible ? '' : 'style="display:none"'} ${name ? `data-name="${name}"` : ''}>
      <fieldset class="govuk-fieldset">
        <legend class="govuk-fieldset__legend"><h3 class="govuk-heading-s">${legend}</h3></legend>
        <div class="govuk-radios govuk-radios--small" data-module="govuk-radios">
          ${items.map(i => `
            <div class="govuk-radios__item">
              <input class="govuk-radios__input${i.default ? ' default-radio' : ''}" id="${i.id}" name="${name}" type="radio" value="${i.value}" ${i.value === checkedValue ? 'checked' : ''}>
              <label class="govuk-label govuk-radios__label" for="${i.id}">${i.label}</label>
            </div>
          `).join('')}
        </div>
      </fieldset>
    </div>
  `
}

function renderCheckboxes ({ legend, name, items }) {
  return `
    <div class="govuk-form-group">
      <fieldset class="govuk-fieldset">
        <legend class="govuk-fieldset__legend"><h3 class="govuk-heading-s">${legend}</h3></legend>
        <div class="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
          ${items.map(i => `
            <div class="govuk-checkboxes__item">
              <input class="govuk-checkboxes__input" id="${i.id}" name="${name}" type="checkbox" value="${i.value}" ${featureState.includes(i.id) ? 'checked' : ''}>
              <label class="govuk-label govuk-checkboxes__label" for="${i.id}">${i.label}</label>
            </div>
          `).join('')}
        </div>
      </fieldset>
    </div>
  `
}

function renderDatasets () {
  return `
    <div class="fmp-datasets">
      ${datasetsConfig.map(section => {
        if (section.type === 'radios') {
          const checked = datasetState.find(id => section.items.some(i => i.value === id))
          return renderRadios({ ...section, visible: !!checked, checkedValue: checked })
        }
        return renderCheckboxes(section)
      }).join('')}
    </div>
  `
}

function renderMenuHTML (feature) {
  const html = `
    ${renderMenu(feature)}
    ${renderDatasets()}
    ${sliderMarkUp}
  `
  addDatasetChangeHandler()
  return html
}

/* -------------------------------
   Public API
-------------------------------- */

export {
  addMenuClickHandlers,
  toggleButtonState,
  renderMenuHTML,
  hideMenu
}
