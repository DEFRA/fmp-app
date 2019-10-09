const Wreck = require('@hapi/wreck');
const fs = require('fs');
async function body() {
    try {
        const data = JSON.stringify({ id: 12, isinland: false });
        const { res, payload } = await Wreck.post('http://localhost:8050/poc/dataset', {
            payload: data
        })
        var contentsAsJSON = JSON.parse(payload);
        var keys = Object.keys(contentsAsJSON);
        var content = [{
            text: `${contentsAsJSON.ReportTypeName}\n\n`, style: {
                fontSize: 18,
                bold: true,
                underline: true
            },
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
            text: ` \n\n Contents:  \n\n  ${contentsAsJSON.ContentListData}  \n\n`, style: {
                fontSize: 12,
                italics: true
            },
        },
        {
            text: `${contentsAsJSON.Disclaimer}`
        },

        {
            text: ` \n\n  ${contentsAsJSON.FloodMapConfirmation.heading}  \n\n`, style: {
                fontSize: 12,
                italics: true
            }
        },
        {
            text: ` \n\n  ${contentsAsJSON.FloodMapConfirmation['sub-heading']}  \n\n`, style: {
                fontSize: 12,
                italics: true
            }
        },

        `\n\n  ${contentsAsJSON.FloodMapConfirmation.text} \n\n `,
        {
            image: `${contentsAsJSON.Maps}`, height: 400, width: 400
        }
        ];
        return content;
    } catch (error) {
        return error;
    }
};
module.exports = body;
