const pdfMake = require('../node_modules/pdfmake/build/pdfmake');
const vfsFonts = require('../node_modules/pdfmake/build/vfs_fonts');
pdfMake.vfs = vfsFonts.pdfMake.vfs;

var fs = require('fs');
const header = require('./header');
const footer = require('./footer');
const body = require('./body');
const Boom = require('boom');
const sgMail = require('./email')


var completedPDFData = async () => {
    try {
        var bodyData = await body();
        var footerData = await footer();
        var headerData = await header();
        var fullContentForPDF = {
            content: bodyData,
            footer: footerData,
            header: headerData
        };
        pdfMake.createPdf(fullContentForPDF).getBase64(function (encodedString) {
            const msg = {
                to: 'defra.test.warrington@gmail.com',
                from: 'defra.test.warrington@gmail.com',
                subject: 'Message from the Flood Map Team',
                text: 'Product4 Flood Map',
                attachments: [
                    {
                        content: encodedString, 
                        filename:'test.pdf',
                        type: "application/pdf"
                    },
                ]
            };
            sgMail.send(msg);
        });
    }
    catch (err) {
        return Boom.badImplementation(`${err.message, err}, issue occured in generating the complete PDF`)
    }
}
module.exports = completedPDFData;