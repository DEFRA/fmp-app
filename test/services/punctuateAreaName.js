const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()

const { punctuateAreaName } = require('../../server/services/punctuateAreaName')

const areaNames = [
  ['Cumbria and Lancashire', 'Cumbria and Lancashire'],
  ['Devon Cornwall and the Isles of Scilly', 'Devon, Cornwall and the Isles of Scilly'],
  ['East Anglia', 'East Anglia'],
  ['East Midlands', 'East Midlands'],
  ['Greater Manchester Merseyside and Cheshire', 'Greater Manchester, Merseyside and Cheshire'],
  ['Hertfordshire and North London', 'Hertfordshire and North London'],
  ['Kent South London and East Sussex', 'Kent, South London and East Sussex'],
  ['Lincolnshire and Northamptonshire', 'Lincolnshire and Northamptonshire'],
  ['North East', 'North East'],
  ['Solent and South Downs', 'Solent and South Downs'],
  ['Thames', 'Thames'],
  ['Wessex', 'Wessex'],
  ['West Midlands', 'West Midlands'],
  ['Yorkshire', 'Yorkshire'],
  ['East Anglia', 'East Anglia'],
  ['West Midlands', 'West Midlands'],
  ['', ''],
  [undefined, undefined]
]

lab.experiment('Test that punctuateAreaName adds commas to area names.', () => {
  areaNames.forEach(([dbName, correctedName]) => {
    lab.test(`It should display "${dbName}" as "${correctedName}"`, async () => {
      Code.expect(punctuateAreaName(dbName)).to.equal(correctedName)
    })
  })
})
