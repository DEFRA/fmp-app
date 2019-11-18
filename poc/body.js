const Wreck = require('@hapi/wreck');
const fs = require('fs');
async function body(customerRequestData) {
    try {
        const data = JSON.stringify({ id: 12, isinland: false });
        const { res, payload } = await Wreck.post('http://localhost:8050/poc/dataset', {
            payload: data
        })
        var contentsAsJSON = JSON.parse(payload);
        var keys = ['Reference', 'Place Or Postcode', 'Requested By', 'Date']
        var content = [
            //    {
            //     text: `${contentsAsJSON.ReportTypeName}\n\n`, style: {
            //         fontSize: 18,
            //         bold: true,
            //         underline: true
            //     },
            // },
            {
                style: 'tableExample \n\n ',
                table: {
                    body: [
                        [keys[0], keys[1], keys[2], keys[3]],
                        [customerRequestData.id, customerRequestData.PlaceOrPostcode, customerRequestData.RequestedBy, customerRequestData.Date]
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
                image: `${contentsAsJSON.floodMap}`, height: 700, width: 500
            },
            {
                text: '\n\n\n\n Nodal Points Data',
                fontSize: 12,
                bold: true

            },
            {
                image: `${contentsAsJSON.nodalPointsMap}`, height: 700, width: 500
            },
            {
                text: '\n\n\n\n Nodal Points Data table',
                fontSize: 12,
                bold: true

            },
            {
                image: `${contentsAsJSON.modelledDataPointsMap}`, height: 700, width: 500
            },

            {
                text: '\n\n\n\n Historic Flood Map',
                fontSize: 12,
                bold: true

            },
            {
                image: `${contentsAsJSON.historicFloodMap}`, height: 700, width: 500
            }
        ];
        return content;
    } catch (error) {
        return error;
    }
};
module.exports = body;
