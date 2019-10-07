const pdfMake = require('../node_modules/pdfmake/build/pdfmake');
const vfsFonts = require('../node_modules/pdfmake/build/vfs_fonts');
pdfMake.vfs = vfsFonts.pdfMake.vfs;

var fs = require('fs');
const header = require('./header');
const footer = require('./footer');
const body = require('./body');
const Boom = require('boom');


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
        pdfMake.createPdf(fullContentForPDF).getBuffer(function (result) {
            fs.writeFile(`generatedpdfs/${new Date().toISOString()}.pdf`, result, function (err) {
                if (err) throw err;
            });
        });
    }
    catch (err) {
        return Boom.badImplementation(`${err.message, err}, issue occured in generating the complete PDF`)
    }
}
module.exports = completedPDFData;