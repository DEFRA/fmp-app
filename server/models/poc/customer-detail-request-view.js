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
    this.isfirstname = data.type === 'firstname';
    this.lastname = data.lastname
    this.islastname = data.type === 'lastname'
    this.email = data.email
    this.isemail = data.type === 'email'
    this.confirmemail = data.confirmemail
    this.isconfirmemail = data.type === 'confirmemail'

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
    if (errors) {
        this.errors = {}
        // lastname
        const lastnameErrors = errors.find(e => e.path[0] === 'lastname')
        if (lastnameErrors) {
            this.errors.lastname = 'You need to give a lastname'
            this.analyticsEvents.push({
                hitType: 'event',
                eventCategory: 'FMP',
                eventAction: 'home:submit invalid lastname',
                eventLabel: this.lastname
            })
        }
    }
    if (errors) {
        this.errors = {}
        // email
        const emailErrors = errors.find(e => e.path[0] === 'email')
        if (emailErrors) {
            this.errors.email = 'You need to give a email'
            this.analyticsEvents.push({
                hitType: 'event',
                eventCategory: 'FMP',
                eventAction: 'home:submit invalid email',
                eventLabel: this.email
            })
        }
    }
    if (errors) {
        this.errors = {}
        // confirmemail
        const confirmemailErrors = errors.find(e => e.path[0] === 'confirmemail')
        if (confirmemailErrors) {
            this.errors.confirmemail = 'You need to give a confirmemail'
            this.analyticsEvents.push({
                hitType: 'event',
                eventCategory: 'FMP',
                eventAction: 'home:submit invalid confirmemail',
                eventLabel: this.confirmemail
            })
        }
    }
}

module.exports = CustomerDetailRequestViewModel
