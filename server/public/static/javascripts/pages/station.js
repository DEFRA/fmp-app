(function (window, flood) {
  var charts = flood.charts
  if (document.getElementById('line-chart')) {
    var lineChart = charts.createLineChart('line-chart', {
      now: new Date(),
      observed: window.flood.model.telemetry,
      forecast: window.flood.model.ffoi ? window.flood.model.ffoi.processedValues : []
    })
    if (flood.utils.getParameterByName('i')) {
      var impactId = flood.utils.getParameterByName('i')
      var impact = flood.model.impacts.find(x => x.impactid === parseInt(impactId))
      // console.log(impact)
      lineChart.addThreshold({
        id: impactId,
        level: impact.value,
        name: impact.shortname
      })
    } else if (flood.model.station.percentile5) {
      lineChart.addThreshold({
        id: 'alert',
        level: flood.model.station.percentile5,
        name: 'Top of typical range'
      })
    }
    document.querySelectorAll('.defra-table-impact__row').forEach(impact => {
      impact.querySelector('.defra-button-text-s').addEventListener('click', function (e) {
        lineChart.addThreshold({
          id: impact.getAttribute('data-id'),
          level: Number(impact.getAttribute('data-level')),
          name: impact.getAttribute('data-name')
        })
      })
    })
  }
})(window, window.flood)
