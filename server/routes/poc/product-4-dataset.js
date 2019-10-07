const completedPDFData = require('./../../../poc/completepdfpage');

module.exports = [{
    method: 'GET',
    path: '/poc/dataset',
    options: {
        handler: async (request, h) => {
            return h.view('poc-pdf');
        }
    }
},
{
    method: 'POST',
    path: '/poc/dataset',
    options: {
        handler: async (request, h) => {
            await completedPDFData();
            return 'pdf generated';
        }
    }
}]