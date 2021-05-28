module.exports = {
  400: '<h1 class="heading-xlarge" tabindex="0">Sorry, this service is temporarily unavailable</h1>',
  404: '<h1 class="heading-xlarge" tabindex="0">This page can’t be found</h1>',
  500: '<h1 class="heading-xlarge" tabindex="0">Sorry, this service is temporarily unavailable</h1>',
  home: {
    standard: '<h1 class="heading-xlarge">Flood map for planning</h1>',
    invalidPlaceOrPostcode: '<span class="error-message">You need to give a place or postcode</span>',
    invalidNationalGridReference: '<span class="error-message">You need to give a National Grid Reference (NGR)</span>',
    invalidEasting: '<span class="error-message">You need to give an easting</span>',
    invalidNorthing: '<span class="error-message">You need to give a northing</span>',
    invalidEastingAndNorthing: '<span class="error-message">You need to give an easting and northing</span>'
  },
  'confirm-location': {
    standard: '<h1 class="heading-xlarge">Likelihood of flooding in this area</h1>'
  },
  summary: {
    standard: '<h1 class="heading-xlarge">Likelihood of flooding in this area</h1>',
    zone1: '<h2 class="heading-large">Flood zone 1</h2>',
    zone2: '<h2 class="heading-large">Flood zone 2</h2>',
    zone3: '<h2 class="heading-large">Flood zone 3</h2>',
    zoneAreaBen: '<h3 class="heading-medium">area that benefits from flood defences</h3>'
  },
  'not-england': {
    standard: '<h1 class="heading-xlarge">This service is for locations in England only</h1>'
  }
}
