require('dotenv').config({ path: 'config/.env-example' })
const ngrToBng = require('../../services/ngr-to-bng')

describe('ngr-to-bng', () => {
  it('ngrToBngService should call ngrToBng', async () => {
    const BNG = await ngrToBng.convert('TQ2770808448')
    expect(BNG.easting).toEqual(527708)
    expect(BNG.northing).toEqual(108448)
  })
})
