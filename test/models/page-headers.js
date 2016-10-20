module.exports = {
  400: '<h1 class="heading-xlarge" tabindex="0">Sorry, this service is temporarily unavailable</h1>',
  404: '<h1 class="heading-xlarge" tabindex="0">This page can’t be found</h1>',
  500: '<h1 class="heading-xlarge" tabindex="0">Sorry, this service is temporarily unavailable</h1>',
  home: {
    standard: '<h1 class="heading-xlarge">Flood map for planning</h1>',
    noPlace: 'Please enter a valid postcode, place or National Grid Reference, then select \'Continue\'',
    invalidPlace: '<div class="error-message">The postcode, place or National Grid Reference you entered is not recognised.<br>Please try again, then select \'Continue\'</div>'
  },
  'confirm-location': {
    standard: '<h1 class="heading-xlarge">Confirm the development location</h1>'
  },
  summary: {
    standard: '<h1 class="heading-xlarge">Flood probability</h1>',
    zone1: '<h2 class="heading-large">Flood zone 1</h2>',
    zone2: '<h2 class="heading-large">Flood zone 2</h2>',
    zone3: '<h2 class="heading-large">Flood zone 3</h2>',
    zoneAreaBen: '<h3 class="heading-medium">area that benefits from flood defences</h3>'
  },
  'not-england': {
    standard: '<h1 class="heading-xlarge">We provide flood probability information for England only</h1>'
  }
}
