const { getContacts } = require('./agol/getContacts')

const getPsoContactsByPolygon = async (polygon) => {
  try {
    return await getContacts({ geometryType: 'esriGeometryPolygon', polygon })
  } catch (error) {
    console.log('Fetching Pso contacts by polygon failed: ', error)
    throw new Error('Fetching Pso contacts by polygon failed: ', error)
  }
}

module.exports = { getPsoContactsByPolygon }
