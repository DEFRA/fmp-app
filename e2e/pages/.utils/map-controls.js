// Left-hand map configuration panel
export const menuSection = (text) => ({ type: 'menuSection', text })
export const menuButtonOption = (text) => ({ type: 'menuButtonOption', text })
export const menuItemOption = (text) => ({ type: 'menuItemOption', text })
export const menuRadioOption = (text) => ({ type: 'menuRadioOption', text })
export const menuCheckboxOption = (text) => ({ type: 'menuCheckboxOption', text })
export const mapSwitch = (text) => ({ type: 'mapSwitch', text })

// Right-hand map interaction controls
export const mapButton = (text) => ({ type: 'mapButton', text })
export const mapButtonById = (id) => ({ type: 'mapButton', id })
export const mapLink = (text) => ({ type: 'mapLink', text })
// For anchors with role="button" overriding native link semantics (e.g. Help)
export const mapButtonLink = (text) => ({ type: 'mapButtonLink', text })
export const mapMenuButton = (text) => ({ type: 'mapMenuButton', text })
export const mapMenuOption = (text) => ({ type: 'mapMenuOption', text })
