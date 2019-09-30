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
            const data = JSON.stringify({ id: 13, isinland:true });
            const { res, payload } = await Wreck.post('http://localhost:8050/poc/dataset', {
                payload: data
            })
            var contentsAsJSON = JSON.parse(payload);
            var keys = Object.keys(contentsAsJSON);
            var contentforPDF = {
                content: [{
                    text: `${contentsAsJSON.ReportTypeName}\n\n`, style: 'header'
                },
                {
                    style: 'tableExample \n\n ',
                    table: {
                        body: [
                            [keys[1], keys[2], keys[3], keys[4]],
                            [contentsAsJSON.CustomerReference, contentsAsJSON['Product4(Detailed Flood Risk)'], contentsAsJSON['Requested By'], contentsAsJSON['Date Requested']]
                        ]
                    }
                },
                {
                    text: ` \n\n Contents:  \n\n  ${contentsAsJSON.ContentListData}  \n\n`, style: 'subheader'
                },
                {
                    text: `${contentsAsJSON.Disclaimer}`
                },

                {
                    text: ` \n\n  ${contentsAsJSON.FloodMapConfirmation.heading}  \n\n`, style: 'subheader'
                },
                {
                    text: ` \n\n  ${contentsAsJSON.FloodMapConfirmation['sub-heading']}  \n\n`, style: 'subheader'
                },

                `\n\n  ${contentsAsJSON.FloodMapConfirmation.text} \n\n `,


                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        underline: true
                    },
                    subheader: {
                        fontSize: 12,
                        italics: true
                    },
                    quote: {
                        italics: true
                    },
                    small: {
                        fontSize: 8
                    }
                }
            };
            pdfMake.createPdf(contentforPDF).getBuffer(function (result) {
                fs.writeFile(`generatedpdfs/${contentsAsJSON.ReportTypeName}-${new Date().toISOString()}.pdf`, result, function (err) {
                    if (err) throw err;
                });
            });
            return 'pdf generated';
        }
    }
}]