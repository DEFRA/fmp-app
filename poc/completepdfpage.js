const pdfMake = require('../node_modules/pdfmake/build/pdfmake');
const vfsFonts = require('../node_modules/pdfmake/build/vfs_fonts');
pdfMake.vfs = vfsFonts.pdfMake.vfs;

var fs = require('fs');
const header = require('./header');
const footer = require('./footer');
const body = require('./body');
const Boom = require('boom');
const sgMail = require('./email')


var completedPDFData = async (customerRequestData) => {
    try {
        var toEmail = customerRequestData.Email;
        var bodyData = await body(customerRequestData);
        var footerData = await footer();
     
        // var headerData = await header();
        var fullContentForPDF = {
            content: bodyData,
            footer: footerData,
            //   header: headerData
        };
        pdfMake.createPdf(fullContentForPDF).getBuffer(function (result) {
            fs.writeFile(`generatedpdfs/${new Date().toISOString()}.pdf`, result, function (err) {
                if (err) throw err;
            });
        });
        pdfMake.createPdf(fullContentForPDF).getBase64(function (encodedString) {
            try {
                const msg = {
                    to: toEmail,
                    from: 'defra.test.warrington@gmail.com',
                    subject: 'Message from the Flood Map Team',
                    text: 'Product4 Flood Map',
                    attachments: [
                        {
                            content: encodedString,
                            filename: 'Product4Report.pdf',
                            type: "application/pdf"
                        },
                    ]
                };
                sgMail.send(msg);

            } catch (error) {
                throw error;
            }

        });
    }
    catch (err) {
        return Boom.badImplementation(`${err.message, err}, issue occured in generating the complete PDF`)
    }
}
module.exports = completedPDFData;