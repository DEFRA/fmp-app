function CustomerDetailRequestViewModel(data, errors) {
    if (!data) {
        data = {
            type: 'placeOrPostcode'
        }
    }
    this.analyticsEvents = [];
    this.placeOrPostcode = data.placeOrPostcode;
    this.firstname = data.firstname;
    this.lastname = data.lastname;
    this.email = data.email;

    if (errors) {
        // Place or Postcode
        const placeOrPostcodeErrors = errors.find(e => e.path[0] === 'placeOrPostcode')
        if (placeOrPostcodeErrors) {
            if (!this.errors) {
                this.errors = {};
            }
            this.errors.placeOrPostcode = 'You need to give a place or postcode'
            this.analyticsEvents.push({
                hitType: 'event',
                eventCategory: 'FMP',
                eventAction: 'poc-pdf:submit invalid place or postcode',
                eventLabel: this.placeOrPostcode
            })
        }

    }
    if (errors) {

        // Firstname
        const firstnameErrors = errors.find(e => e.path[0] === 'firstname')
        if (firstnameErrors) {
            if (!this.errors) {
                this.errors = {};
            }
            this.errors.firstname = 'You need to give a firstname and max length should be 50 characters'
            this.analyticsEvents.push({
                hitType: 'event',
                eventCategory: 'FMP',
                eventAction: 'poc-pdf:submit invalid firstname',
                eventLabel: this.firstname
            })
        }
    }
    if (errors) {

        // lastname
        const lastnameErrors = errors.find(e => e.path[0] === 'lastname')
        if (lastnameErrors) {
            if (!this.errors) {
                this.errors = {};
            }
            this.errors.lastname = 'You need to give a lastname and max length should be 50 characters'
            this.analyticsEvents.push({
                hitType: 'event',
                eventCategory: 'FMP',
                eventAction: 'poc-pdf:submit invalid lastname',
                eventLabel: this.lastname
            })


        }
        if (errors) {
            // email
            const emailErrors = errors.find(e => e.path[0] === 'email')
            if (emailErrors) {
                if (!this.errors) {
                    this.errors = {};
                }
                this.errors.email = 'You need to provide valid email and max length should be 50 characters'
                this.analyticsEvents.push({
                    hitType: 'event',
                    eventCategory: 'FMP',
                    eventAction: 'poc-pdf:submit invalid email',
                    eventLabel: this.email
                })
            }

        }
    }
}
module.exports = CustomerDetailRequestViewModel