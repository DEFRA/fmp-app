var logoFile = require('../images/logo')
async function header() {
    return [
        {
            image: logoFile.logo, height: 40, width: 100, alignment: 'right'
        }
    ]
};
module.exports = header;