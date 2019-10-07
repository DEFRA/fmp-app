async function footer() {
    return {
        margin: 5,
        columns: [
            {
                fontSize: 6,
                text: [
                    {
                        text: `-----------------------------------------------------------------------------------------------------------------------------` +
                            '\n',
                        margin: [0, 5]
                    },
                    {
                        text: `Orchard House, Endeavour Park, London Road, Addington, West Malling, Kent, ME19 5SH.
            Email: kslenquiries@environment-agency.gov.uk `
                    }
                ],
                alignment: 'center'
            }
        ]
    };

};

module.exports = footer;