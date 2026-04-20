import { definePage } from './.utils/page.js'
import { button, link, textInput, selectInput } from './.utils/form-controls.js'

export const page = definePage({
  slug: '/next-steps',
  title: 'Next steps for your planning application'
})

// P1 Map Controls
export const addReferenceToFloodMapDetails = button('Add a reference to the flood map and set the scale')
export const addReferenceInput = textInput('Add a reference')
export const scaleSelect = selectInput('Scale')
export const downloadFloodMapButton = button('Download flood map for this location (PDF)')
// editBoundaryButton only shows when the polygon selected is over 300 hectares
export const editBoundaryLink = link('Edit boundary')
export const orderFloodRiskDataButton = link('Order flood risk data')

// Internal links
export const floodZonesAndWhatTheyMeanLink = link('flood zones and what they mean')

// External links
export const takeIntoAccountClimateChangeAllowancesLink = link('take into account climate change allowances')
export const howToDoAnAssessmentLink = link('how to do an assessment')
export const reservoirFloodRiskLink = link('reservoir flood risk')
export const britishGeologicalSurveyGroundwaterFloodingLink = link('British Geological Survey groundwater flooding data')
export const groundwaterCurrentStatusAndFloodRiskLink = link('groundwater: current status and flood risk')
export const miningAndGroundwaterConstraintsForDevelopmentLink = link('mining and groundwater constraints for development')
export const residualRiskLink = link('residual risk')
export const findOutWhatProductsAreAvailableLink = link('Find out what products are available')
