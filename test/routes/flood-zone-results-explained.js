const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const { JSDOM } = require('jsdom')

lab.experiment('flood-zone-results-explained', () => {
  let server
  const baseUrl = '/flood-zone-results-explained'

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
  })

  const getDocument = async (zone) => {
    const url = zone ? `${baseUrl}?zone=${zone}` : baseUrl
    const options = { method: 'GET', url }
    const response = await server.inject(options)
    const { payload } = response
    const { window: { document: doc } } = await new JSDOM(payload)
    const documentBody = doc.querySelector('#flood-zone-results-explained > .govuk-grid-column-two-thirds')
    return { response, documentBody }
  }

  const zoneValues = [undefined, 'FZ1', 'FZ2', 'FZ2a', 'FZ3', 'FZ3a']
  zoneValues.forEach(async (zone) => {
    lab.test(`get flood-zone-results-explained should contain a single h1 - ${zone}`, async () => {
      const { response, documentBody } = await getDocument(zone)
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(documentBody.querySelector('h1').textContent).to.contain('Flood zones explained')
    })

    lab.test(`get flood-zone-results-explained should contain a heading for each zone ${zone} (3 or 4 with defences) `, async () => {
      const { documentBody } = await getDocument(zone)
      const heading2Array = documentBody.querySelectorAll('h2')

      // There should be 3 headings (4 with defences)
      const expectDefencesMarkup = (zone === 'FZ2a' || zone === 'FZ3a')
      Code.expect(heading2Array.length).to.equal(expectDefencesMarkup ? 4 : 3)
      Code.expect(heading2Array[0].textContent).to.contain('Flood zone 1')
      Code.expect(heading2Array[1].textContent).to.contain('Flood zone 2')
      Code.expect(heading2Array[2].textContent).to.contain('Flood zone 3')
      if (expectDefencesMarkup) {
        Code.expect(heading2Array[3].textContent).to.contain('Flood defences')
      }
    })

    lab.test(`get flood-zone-results-explained should contain a paragraph for each zone ${zone} (3 or 4 with defences) `, async () => {
      const { documentBody } = await getDocument(zone)
      const paragraphArray = documentBody.querySelectorAll('p.govuk-body')

      // There should be 4 paragraphs (6 with defences)
      const expectDefencesMarkup = (zone === 'FZ2a' || zone === 'FZ3a')
      Code.expect(paragraphArray.length).to.equal(expectDefencesMarkup ? 6 : 4)
    })

    lab.test(`get flood-zone-results-explained for all zones should contain an overview explanation - zone ${zone}`, async () => {
      const { documentBody } = await getDocument(zone)
      const paragraphArray = documentBody.querySelectorAll('p.govuk-body')

      // Paragraph 0
      Code.expect(paragraphArray[0].textContent).to.contain(
        'Flood zones are based on how likely it is that a location will flood from rivers and the sea. They do not take into account:'
      )
    })

    lab.test(`get flood-zone-results-explained for all zones should contain a zone 1 explanation - zone ${zone}`, async () => {
      const { documentBody } = await getDocument(zone)
      const paragraphArray = documentBody.querySelectorAll('p.govuk-body')
      // Paragraph 1
      Code.expect(paragraphArray[1].textContent).to.contain(
        'Locations have a low probability of flooding, some locations will need a flood risk assessment. Find out'
      )
      Code.expect(paragraphArray[1].textContent).to.contain(
        'when you need a flood risk assessment for development in flood zone 1'
      )
    })

    lab.test(`get flood-zone-results-explained for all zones should contain a zone 2 explanation - zone ${zone}`, async () => {
      const { documentBody } = await getDocument(zone)
      const paragraphArray = documentBody.querySelectorAll('p.govuk-body')
      // Paragraph 2
      Code.expect(paragraphArray[2].textContent).to.contain(
        'Locations have a medium probability of flooding. Developments will need a flood risk assessment.'
      )
    })

    lab.test(`get flood-zone-results-explained for all zones should contain a zone 3 explanation - zone ${zone}`, async () => {
      const { documentBody } = await getDocument(zone)
      const paragraphArray = documentBody.querySelectorAll('p.govuk-body')
      // Paragraph 3
      Code.expect(paragraphArray[3].textContent).to.contain(
        'Locations have a high probability of flooding. Developments will need a flood risk assessment.'
      )
    })
  })
  const zonesWithDefencesValues = ['FZ2a', 'FZ3a']
  zonesWithDefencesValues.forEach(async (zone) => {
    lab.test(`get flood-zone-results-explained for FZ2a and FZ3a should contain a defences statement - zone ${zone}`, async () => {
      const { documentBody } = await getDocument(zone)
      const paragraphArray = documentBody.querySelectorAll('p.govuk-body')
      // Paragraph 4
      Code.expect(paragraphArray[4].textContent).to.contain(
        'There are flood defences in part or all of the location you selected.'
      )
    })

    lab.test(`get flood-zone-results-explained for FZ2a and FZ3a should contain a defences explanation header - zone ${zone}`, async () => {
      const { documentBody } = await getDocument(zone)
      const paragraphArray = documentBody.querySelectorAll('p.govuk-body')
      // Paragraph 5
      Code.expect(paragraphArray[5].textContent).to.contain(
        'Flood defences:'
      )
    })

    lab.test(`get flood-zone-results-explained for FZ2a and FZ3a should contain a defences explanation header - zone ${zone}`, async () => {
      const { documentBody } = await getDocument(zone)
      const listArray = documentBody.querySelectorAll('ul.govuk-list.govuk-list--bullet')
      // Paragraph 5
      Code.expect(listArray[1].textContent).to.contain(
        'reduce the probability of flooding from a specific source (a river or the sea), but do not completely remove the risk'
      )
      Code.expect(listArray[1].textContent).to.contain(
        'do not reduce the probability of flooding from other sources'
      )
      Code.expect(listArray[1].textContent).to.contain(
        'can fail or a flood that is bigger than the one the defence is designed to protect against could happen'
      )
      Code.expect(listArray[1].textContent).to.contain(
        'will provide reduced protection over time because of climate change increasing flood risk in the future'
      )
    })
  })
})
