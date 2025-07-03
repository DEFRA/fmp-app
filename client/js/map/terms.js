const riversAndSeasWarning = `
<details class="govuk-details govuk-!-font-size-16" "="">
  <summary class="govuk-details__summary"> <span class="govuk-details__summary-text">How to use rivers and sea data</span></summary>
  <div class="govuk-details__text">
    <p class="govuk-body">
      Rivers and sea supporting data is given to help you further investigate flood risk.
    </p>
    <p class="govuk-body">
      <a href="/how-to-use-rivers-and-sea-data">Find out more about this data and how it should be used.</a>
    </p>
    <p class="govuk-body"> In some locations the rivers and sea supporting data may show inconsistent results. </p>
    <p class="govuk-body"> The flood zones are not affected by this issue. </p>
  </div>
</details>`

const floodZone3bNotice = `
<details class="govuk-details govuk-!-font-size-16">
  <summary class="govuk-details__summary">
    <span class="govuk-details__summary-text">3.3% (1 in 30) and flood zone 3b</span>
  </summary>
  <div class="govuk-details__text">
    This data is shown to help local authorities define the functional floodplain, flood zone 3b
  </div>
</details>`

const terms = {
  labels: {
    noData: 'No data available',
    climateChange: 'Climate change',
    presentDay: 'Present day'
  },
  chance: {
    rsHigh: 'Rivers and sea 1 in 30',
    rsMedium: 'Rivers 1 in 100, Sea 1 in 200',
    rsLow: 'Rivers and sea 1 in 1000',
    swHigh: '1 in 30',
    swMedium: '1 in 100',
    swLow: '1 in 1000'
  },
  likelihoodchance: {
    rsHigh: '<p class="govuk-body-s">3.3% (1 in 30)</br>chance of flooding each year</p>',
    rsMedium: '<p class="govuk-body-s">Rivers 1% (1 in 100)</br>Sea 0.5% (1 in 200)</br>chance of flooding each year</p>',
    rsLow: '<p class="govuk-body-s">0.1% (1 in 1000)</br>chance of flooding each year</p>',
    swHigh: '3.3% (1 in 30)</br>chance of flooding each year',
    swMedium: '1% (1 in 100)</br>chance of flooding each year',
    swLow: '0.1% (1 in 1000)</br>chance of flooding each year'
  },
  additionalInfo: {
    rsHighDefended: `<p class="govuk-body-s">${riversAndSeasWarning}${floodZone3bNotice}</p>`,
    rsHigh: `<p class="govuk-body-s">${riversAndSeasWarning}</p>`,
    rsMedium: `<p class="govuk-body-s">${riversAndSeasWarning}</p>`,
    rsLow: `<p class="govuk-body-s">${riversAndSeasWarning}</p>`
  }
}

export { terms }
