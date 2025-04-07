import { terms } from './terms.js'

const surfaceWaterStyleLayers = [
  'Risk of Flooding from Surface Water Depth > 0mm/1',
  'Risk of Flooding from Surface Water Depth > 200mm/1',
  'Risk of Flooding from Surface Water Depth > 300mm/1',
  'Risk of Flooding from Surface Water Depth > 600mm/1',
  'Risk of Flooding from Surface Water Depth > 900mm/1',
  'Risk of Flooding from Surface Water Depth > 1200mm/1'
]
// const surfaceWaterCcLowStyleLayers = [
//   'Risk of Flooding from Surface Water Depth CCSW1 > 0mm/1',
//   'Risk of Flooding from Surface Water Depth CCSW1 > 200mm/1',
//   'Risk of Flooding from Surface Water Depth CCSW1 > 300mm/1',
//   'Risk of Flooding from Surface Water Depth CCSW1 > 600mm/1',
//   'Risk of Flooding from Surface Water Depth CCSW1 > 900mm/1',
//   'Risk of Flooding from Surface Water Depth CCSW1 > 1200mm/1'
// ]

const vtLayers = [
  {
    name: 'Flood_Zones_2_and_3_Rivers_and_Sea',
    q: 'fz',
    styleLayers: [
      'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 3/1',
      'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 2/1'
    ]
  },
  {
    name: 'Flood_Zones_2_and_3_Rivers_and_Sea_CCP1',
    q: '', // Implies disabled for now
    styleLayers: [
      'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zone 3/1',
      'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zone 2/1'
    ]
  },
  {
    name: 'Rivers_1_in_30_Sea_1_in_30_Defended',
    q: '', // Implies disabled for now
    styleLayers: ['Rivers 1 in 30 Sea 1 in 30 Defended/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsHigh,
    additionalInfo: terms.additionalInfo.rsHighDefended
  },
  {
    name: 'Rivers_1_in_30_Sea_1_in_30_Defended_Extents',
    q: 'rsdpdhr',
    styleLayers: ['Rivers 1 in 30 Sea 1 in 30 Defended Extents/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsHigh,
    additionalInfo: terms.additionalInfo.rsHighDefended
  },
  {
    name: 'Rivers_1_in_100_Sea_1_in_200_Defended_Extents',
    q: 'rsdpdmr',
    styleLayers: ['Rivers 1 in 100 Sea 1 in 200 Defended Extents/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsMedium,
    additionalInfo: terms.additionalInfo.rsMedium
  },
  {
    name: 'Rivers_1_in_100_Sea_1_in_200_Undefended_Extents',
    q: 'rsupdmr',
    styleLayers: ['Rivers 1 in 100 Sea 1 in 200 Undefended Extents/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsMedium,
    additionalInfo: terms.additionalInfo.rsMedium
  },
  {
    name: 'Rivers_1_in_1000_Sea_1_in_1000_Defended_Extents',
    q: 'rsdpdlr',
    styleLayers: ['Rivers 1 in 1000 Sea 1 in 1000 Defended Extents/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsLow,
    additionalInfo: terms.additionalInfo.rsLow
  },
  {
    name: 'Rivers_1_in_1000_Sea_1_in_1000_Undefended_Extents',
    q: 'rsupdlr',
    styleLayers: ['Rivers 1 in 1000 Sea 1 in 1000 Undefended Extents/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsLow,
    additionalInfo: terms.additionalInfo.rsLow
  },
  {
    name: 'Rivers_1_in_30_Sea_1_in_30_Defended_CCP1',
    q: '', // Implies disabled for now
    styleLayers: ['Rivers 1 in 30 Sea 1 in 30 Defended CCP1/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsHigh,
    additionalInfo: terms.additionalInfo.rsHighDefended
  },
  {
    name: 'Rivers_1_in_30_Sea_1_in_30_Defended_Extents_CCP1',
    q: 'rsdclhr',
    styleLayers: ['Rivers 1 in 30 Sea 1 in 30 Defended Extents CCP1/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsHigh,
    additionalInfo: terms.additionalInfo.rsHighDefended
  },
  {
    name: 'Rivers_1_in_100_Sea_1_in_200_Defended_Extents_CCP1',
    q: 'rsdclmr',
    styleLayers: ['Rivers 1 in 100 Sea 1 in 200 Defended Extents CCP1/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsMedium,
    additionalInfo: terms.additionalInfo.rsMedium
  },
  {
    name: 'Rivers_1_in_100_Sea_1_in_200_Undefended_Extents_CCP1',
    q: 'rsuclmr',
    styleLayers: ['Rivers 1 in 100 Sea 1 in 200 Undefended Extents CCP1/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsMedium,
    additionalInfo: terms.additionalInfo.rsMedium
  },
  {
    name: 'Rivers_1_in_1000_Sea_1_in_1000_Defended_Extents_CCP1',
    q: 'rsdcllr',
    styleLayers: ['Rivers 1 in 1000 Sea 1 in 1000 Defended Extents CCP1/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsLow,
    additionalInfo: terms.additionalInfo.rsLow
  },
  {
    name: 'Rivers_1_in_1000_Sea_1_in_1000_Undefended_Extents_CCP1',
    q: 'rsucllr',
    styleLayers: ['Rivers 1 in 1000 Sea 1 in 1000 Undefended Extents CCP1/1'],
    likelihoodchanceLabel: terms.likelihoodchance.rsLow,
    additionalInfo: terms.additionalInfo.rsLow
  },
  {
    name: 'Risk_of_Flooding_from_Surface_Water_Low',
    q: 'swlr',
    styleLayers: surfaceWaterStyleLayers,
    likelihoodchanceLabel: terms.likelihoodchance.swLow
  },
  {
    name: 'Risk_of_Flooding_from_Surface_Water_Medium',
    q: 'swmr',
    styleLayers: surfaceWaterStyleLayers,
    likelihoodchanceLabel: terms.likelihoodchance.swMedium
  },
  {
    name: 'Risk_of_Flooding_from_Surface_Water_High',
    q: 'swhr',
    styleLayers: surfaceWaterStyleLayers,
    likelihoodchanceLabel: terms.likelihoodchance.swHigh
  }
  // ,
  // {
  //   name: 'Risk_of_Flooding_from_Surface_Water_CCSW1_Low',
  //   q: 'swcllr',
  //   styleLayers: surfaceWaterCcLowStyleLayers,
  //   likelihoodLabel: terms.likelihood.swLow
  // },
  // {
  //   name: 'Risk_of_Flooding_from_Surface_Water_CCSW1_Medium',
  //   q: 'swclmr',
  //   styleLayers: surfaceWaterStyleLayers,
  //   likelihoodLabel: terms.likelihood.swMedium
  // },
  // {
  //   name: 'Risk_of_Flooding_from_Surface_Water_CCSW1_High',
  //   q: 'swclhr',
  //   styleLayers: surfaceWaterStyleLayers,
  //   likelihoodLabel: terms.likelihood.swHigh
  // }
]

export { vtLayers, surfaceWaterStyleLayers }
