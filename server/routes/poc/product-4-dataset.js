const Wreck = require('@hapi/wreck');
const pdfMake = require('../../../node_modules/pdfmake/build/pdfmake');
const vfsFonts = require('../../../node_modules/pdfmake/build/vfs_fonts');
pdfMake.vfs = vfsFonts.pdfMake.vfs;
var fs = require('fs');

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
            const data = JSON.stringify({ reportType: 'Coastal', id: 21 });
            const { res, payload } = await Wreck.post('http://localhost:8050/poc/dataset', {
                payload: data
            })
            var contentsAsJSON = JSON.parse(payload);
            var keys = Object.keys(contentsAsJSON);
            var contentforPDF = {
                content: [{
                    text: contentsAsJSON.ReportTypeName, style: 'header'
                },
                {
                    style: 'tableExample',
                    table: {
                        body: [
                            [keys[1], keys[2], keys[3], keys[4]],
                            [contentsAsJSON.CustomerReference, contentsAsJSON['Product4(Detailed Flood Risk)'], contentsAsJSON['Requested By'], contentsAsJSON['Date Requested']]
                        ]
                    }
                }
                ]
            };
            pdfMake.createPdf(contentforPDF).getBuffer(function (result) {
                fs.writeFile(`generatedpdfs/sample1_${new Date().toISOString()}.pdf`, result, function (err) {
                    if (err) throw err;
                });
            });
            return 'pdf generated';
        }
    }
}]