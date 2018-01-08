'use strict'
function HomeViewModel (data, errors) {
  if (!data) {
    data = {
      type: 'placeOrPostcode'
    }
  }

  this.placeOrPostcode = data.placeOrPostcode
  this.nationalGridReference = data.nationalGridReference
  this.easting = data.easting
  this.northing = data.northing

  this.isPlaceOrPostcode = data.type === 'placeOrPostcode'
  this.isNationalGridReference = data.type === 'nationalGridReference'
  this.isEastingNorthing = data.type === 'eastingNorthing'

  if (errors) {
    this.errors = {}

    // Place or Postcode
    const placeOrPostcodeErrors = errors.find(e => e.path[0] === 'placeOrPostcode')
    if (placeOrPostcodeErrors) {
      this.errors.placeOrPostcode = 'You need to give a place or postcode'
    }

    // National Grid Reference
    const ngrErrors = errors.find(e => e.path[0] === 'nationalGridReference')
    if (ngrErrors) {
      this.errors.nationalGridReference = 'You need to give a National Grid Reference (NGR)'
    }

    // Easting
    const eastingErrors = errors.find(e => e.path[0] === 'easting')
    if (eastingErrors) {
      this.errors.easting = 'You need to give an easting'
    }

    // Northing
    const northingErrors = errors.find(e => e.path[0] === 'northing')
    if (northingErrors) {
      this.showNorthingControlInError = true
      if (eastingErrors) {
        this.errors.easting += ' and northing'
      } else {
        this.errors.northing = 'You need to give a northing'
      }
    }
    this.showEastingNorthingGroupInError = !!(eastingErrors || northingErrors)
  }
}

module.exports = HomeViewModel
