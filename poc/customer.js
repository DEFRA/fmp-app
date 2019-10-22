const Wreck = require('@hapi/wreck');
async function SaveCustomerRequest(request) {
    try {
        const { firstname, lastname, email, placeOrPostcode } = request.payload;
        const data = JSON.stringify({ placeOrPostcode, firstname, lastname, email });
        const { res, payload } = await Wreck.post('http://localhost:8050/poc/customer/savecustomerrequest', {
            payload: data
        })
        return JSON.parse(payload);
    } catch (error) {
        throw error;
    }
}
async function GetCustomerRequestDetails(id) {
    try {
        const data = JSON.stringify({id});
        const { res, payload } = await Wreck.post('http://localhost:8050/poc/customer/getcustomerrequestbyid', {
            payload: data
        })
        return JSON.parse(payload);
    } catch (error) {
        throw error;
    }
}

module.exports = { SaveCustomerRequest, GetCustomerRequestDetails };