function CustomerDetailRequestViewModel(data, errors) {
    if (!data) {
        data = {
            type: 'placeOrPostcode'
        }
    }

    this.analyticsEvents = []
    this.placeOrPostcode = data.placeOrPostcode
    this.isPlaceOrPostcode = data.type === 'placeOrPostcode'
    this.firstname = data.firstname
    this.isfirstname = data.type === 'firstname'

    if (errors) {
        this.errors = {}
        // Place or Postcode
        const placeOrPostcodeErrors = errors.find(e => e.path[0] === 'placeOrPostcode')
        if (placeOrPostcodeErrors) {
            this.errors.placeOrPostcode = 'You need to give a place or postcode'
            this.analyticsEvents.push({
                hitType: 'event',
                eventCategory: 'FMP',
                eventAction: 'home:submit invalid place or postcode',
                eventLabel: this.placeOrPostcode
            })
        }
    }
    if (errors) {
        this.errors = {}
        // Firstname
        const firstnameErrors = errors.find(e => e.path[0] === 'firstname')
        if (firstnameErrors) {
            this.errors.firstname = 'You need to give a firstname'
            this.analyticsEvents.push({
                hitType: 'event',
                eventCategory: 'FMP',
                eventAction: 'home:submit invalid firstname',
                eventLabel: this.firstname
            })
        }
    }
}

module.exports = CustomerDetailRequestViewModel
