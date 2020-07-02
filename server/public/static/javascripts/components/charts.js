// Chart component
(function (window, flood) {
  var d3 = window.d3
  var charts = {}

  function LineChart (containerId, data) {
    // Settings
    var windowBreakPoint = 640
    var svgBreakPoint = 576
    var xCutOff = 9

    //
    // Progressive enhancement
    //

    var chart = document.getElementById(containerId)
    // If javascript is enabled make content visible to all but assitive technology
    // var figure = chart.parentNode
    chart.setAttribute('aria-hidden', true)
    chart.removeAttribute('hidden')
    chart.removeAttribute('style')

    // Setup array to combine observed and forecast points
    // and identify startPoint for locator
    var lines = []
    var dataPoint, dataPointLatest, dataPointLocator
    var hasObserved = false
    var hasForecast = false
    if (data.observed.length) {
      lines = data.observed.reverse()
      // First chronolgical point
      dataPoint = JSON.parse(JSON.stringify(data.observed[data.observed.length - 1]))
      hasObserved = true
    }
    if (data.forecast.length) {
      lines = lines.concat(data.forecast)
      hasForecast = true
    }

    // Set dataPointLatest
    dataPointLatest = JSON.parse(JSON.stringify(dataPoint))
    dataPointLocator = dataPointLatest

    // Area generator
    var area = d3.area().curve(d3.curveCardinal)
      .x(function (d) { return x(new Date(d.ts)) })
      .y0(function (d) { return height })
      .y1(function (d) { return y(d._) })

    // Line generator
    var line = d3.line().curve(d3.curveCardinal)
      .x(function (d) { return x(new Date(d.ts)) })
      .y(function (d) { return y(d._) })

    // Initialize svg
    var svg = d3.select('#' + containerId).append('svg').style('pointer-events', 'none')
    // chartWrapper.on('mouseover', function(d) { d3.select(this).style('cursor', 'pointer') })

    var chartWrapper = svg.append('g').style('pointer-events', 'all')
    chartWrapper.append('g').classed('y grid', true)
    chartWrapper.append('g').classed('x grid', true)
    chartWrapper.append('g').classed('x axis', true)
    chartWrapper.append('g').classed('y axis', true)
    chartWrapper.on('click', function () { showTooltip.call(this, null) })
    chartWrapper.on('mousemove', function () { showTooltip.call(this, null) })
    chartWrapper.on('mouseout', function () { hideTooltip.call(this, null) })

    // Add observed and forecast elements
    if (hasObserved) {
      chartWrapper.append('g').classed('observed observed-focus', true)
      var observedArea = svg.select('.observed').append('path').datum(data.observed).classed('observed-area', true)
      var observed = svg.select('.observed').append('path').datum(data.observed).classed('observed-line', true)
    }
    if (hasForecast) {
      chartWrapper.append('g').classed('forecast', true)
      var forecastArea = svg.select('.forecast').append('path').datum(data.forecast).classed('forecast-area', true)
      var forecast = svg.select('.forecast').append('path').datum(data.forecast).classed('forecast-line', true)
    }

    // Add timeline
    if (data.now) {
      var nowContainer = chartWrapper.append('g').classed('time', true)
      nowContainer.append('line').classed('time-line', true)
      nowContainer.append('rect').attr('class', 'time-now-bg').attr('x', -22).attr('y', 20).attr('height', 25).attr('width', 44)
      nowContainer.append('text').attr('class', 'time-now-text').attr('x', -16).attr('y', 37).text('Now')
      var now = svg.select('.time')
    }

    // Add locator
    var locator = chartWrapper.append('g').classed('locator', true)
    locator.append('line').classed('locator-line', true)
    locator.append('circle').attr('r', 4.5).classed('locator-point', true)

    // Add thresholds group
    var thresholdsContainer = chartWrapper.append('g').classed('thresholds', true)

    // Add tooltip container
    var toolTip = chartWrapper.append('g').attr('class', 'tool-tip')
    toolTip.append('rect').attr('class', 'tool-tip-bg')
    toolTip.append('text').attr('class', 'tool-tip-text')

    // Set level and date formats
    var parseTime = d3.timeFormat('%-I:%M%p')
    // var parseDate = d3.timeFormat('%e %b %Y')
    var parseDateShort = d3.timeFormat('%e %b')

    // Variables defined for subsequent methods
    var margin = {}
    var locatorX, locatorY
    var toolTipX = -1
    var toolTipY = -1
    var timeX
    var width, height
    var xExtent, yExtent
    var x, y, xAxis, yAxis

    // Empty thresholds array
    var thresholds = []

    // Modify axis with thresholds and define scales
    modifyAxis()

    // Render the chart
    render()

    function render () {
      // Update dimensions
      updateDimensions()

      // Update svg elements to new dimensions
      chartWrapper.attr('transform', 'translate(' + (margin.left + margin.right) + ',' + 0 + ')')

      // Update the axis and line
      xAxis.scale(x)
      yAxis.scale(y)
      svg.select('.x.axis').attr('transform', 'translate(0,' + height + ')').call(xAxis)
      svg.selectAll('.x.axis text').attr('y', 12)
      svg.select('.y.axis').call(yAxis)

      // Update grid lines
      svg.select('.x.grid')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x)
          .ticks(d3.timeDay, 1)
          .tickSize(-height, 0, 0)
          .tickFormat('')
        )
      svg.select('.y.grid')
        .attr('transform', 'translate(0,' + 0 + ')')
        .call(d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width, 0, 0)
          .tickFormat('')
        )

      // Empty thresholds container
      thresholdsContainer.selectAll('*').remove()
      // Add thresholds
      thresholds.forEach(threshold => {
        var thresholdContainer = thresholdsContainer.append('g').attr('class', 'threshold  threshold--' + threshold.id)
        thresholdContainer.classed('threshold--selected', !!threshold.isSelected)
        var bg = thresholdContainer.append('rect').attr('class', 'threshold__bg').attr('x', 0).attr('y', -4).attr('height', 8)
        var line = thresholdContainer.append('line').attr('class', 'threshold__line')
        var label = thresholdContainer.append('g').attr('class', 'threshold-label')
        // var labelBg = label.append('rect').attr('class', 'threshold-label__bg')
        var labelBgPath = label.append('path').attr('class', 'threshold-label__bg')
        var text = label.append('text').attr('class', 'threshold-label__text').html(threshold.name)
        var remove = label.append('g').attr('class', 'threshold__remove')
        remove.append('rect').attr('x', -6).attr('y', -6).attr('width', 20).attr('height', 20)
        remove.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 8).attr('y2', 8)
        remove.append('line').attr('x1', 8).attr('y1', 0).attr('x2', 0).attr('y2', 8)
        // Set individual elements size and position
        var textWidth = text.node().getBBox().width
        // var textHeight = text.node().getBBox().height
        // labelBg.attr('width', textWidth + 24 + 18 ).attr('height', textHeight + 18)
        // labelBgHeight = labelBg.node().getBBox().height
        labelBgPath.attr('d', 'm0,0 l' + (textWidth + 40) + ',0 l0,36 l-' + ((textWidth + 40) - 50) + ',0 l-8,8 l-8,-8 l-34,0 l0,-36 l0,0')
        text.attr('x', 12).attr('y', 10)
        remove.attr('transform', 'translate(' + (textWidth + 20) + ',' + 14 + ')')
        var labelX = x(xExtent[1]) / 8
        // var labelY = -(labelBg.node().getBBox().height / 2)
        label.attr('transform', 'translate(' + labelX + ',' + -46 + ')')
        thresholdContainer.attr('transform', 'translate(0,' + y(threshold.level) + ')')
        bg.attr('width', x(xExtent[1]))
        line.attr('x2', x(xExtent[1])).attr('y2', 0)
        // Remove button
        remove.on('click', function () {
          d3.event.stopPropagation()
          // console.log(thresholds)
          thresholds = thresholds.filter(function (x) {
            return x.id !== threshold.id
          })
          // console.log(thresholds)
          // Show tooltip
          modifyAxis()
          updateDimensions()
          render()
        })
        /*
        thresholdContainer.append('line').attr('class', 'threshold-cross').attr('x1', 17).attr('y1', -3).attr('x2', 23).attr('y2', 3)
        thresholdContainer.append('line').attr('class', 'threshold-cross').attr('x1', 23).attr('y1', -3).attr('x2', 17).attr('y2', 3)
        */
        // thresholdContainer.append('circle').attr('r', 4.5).attr('class', 'threshold-point')
        thresholdContainer.on('click', function () {
          d3.event.stopPropagation()
          thresholds.forEach(x => { x.isSelected = false })
          threshold.isSelected = true
          // Bring to front
          thresholds = thresholds.filter(function (x) {
            return x.id !== threshold.id
          })
          thresholds.push(threshold)
          // Re render
          render()
        })
        thresholdContainer.on('mousemove', function (d) {
          d3.event.stopPropagation()
        })
        thresholdContainer.on('mouseover', function (d) {
          d3.select(this).classed('threshold--mouseover', true)
        })
        thresholdContainer.on('mouseout', function (d) {
          d3.select(this).classed('threshold--mouseover', false)
        })
      })

      // Update time line
      if (data.now) {
        timeX = Math.floor(x(new Date(data.now)))
        svg.select('.time-line').attr('y1', 0).attr('y2', height)
        now.attr('y1', 0).attr('y2', height).attr('transform', 'translate(' + timeX + ',0)')
        // Add 'today' class to x axis tick
        svg.selectAll('.x .tick')
          .filter(function (d) {
            return new Date(d).getDay() === new Date(data.now).getDay() && new Date(d).getUTCHours() === 12
          })
          .attr('class', 'tick tick-today')
      }

      // Add height to locator line
      svg.select('.locator-line').attr('y1', 0).attr('y2', height)

      // Draw lines and areas
      if (hasObserved) {
        observed.attr('d', line)
        observedArea.attr('d', area)
      }
      if (hasForecast) {
        forecast.attr('d', line)
        forecastArea.attr('d', area)
      }

      // Update locator position
      locator.attr('transform', 'translate(' + locatorX + ',' + 0 + ')')
      locator.select('.locator-point').attr('transform', 'translate(' + 0 + ',' + locatorY + ')')
    }

    function modifyAxis () {
      // Initialize scales
      xExtent = d3.extent(lines, function (d, i) { return new Date(d.ts) })
      yExtent = d3.extent(lines, function (d, i) { return d._ })

      // Increase X range to minimum of 6 hours beyond now value
      var date = new Date(data.now)
      date.setHours(date.getHours() + 8)
      var xRange = [xExtent[0], xExtent[1]]
      xRange.push(date)
      xExtent[0] = Math.min.apply(Math, xRange)
      xExtent[1] = Math.max.apply(Math, xRange)

      // Initialise Y range to highest and lowest values from the data
      var yRange = [yExtent[0], yExtent[1]]
      yExtent[0] = Math.min.apply(Math, yRange)
      yExtent[1] = Math.max.apply(Math, yRange)

      // Add Y Axis buffers
      yExtent[0] = yExtent[0] >= 0 ? 0 : yExtent[0]
      yExtent[1] = yExtent[1] * 2
      yExtent[1] = yExtent[1] <= 1 ? 1 : yExtent[1]

      // Extend to max threshold
      if (thresholds.length) {
        var maxThreshold = Math.max.apply(Math, thresholds.map(function (x) { return x.level }))
        var maxThresholdBuffered = maxThreshold + (maxThreshold / 100 * 20)
        yExtent[1] = yExtent[1] <= maxThresholdBuffered ? maxThresholdBuffered : yExtent[1]
      }

      // Round Y Axis upper to an even number
      // yExtent[1] = (2 * Math.round((yExtent[1]*10)/2))/10

      // Setup scales
      x = d3.scaleTime().domain(xExtent)
      y = d3.scaleLinear().domain(yExtent)
      y.nice()

      // Initialize axis
      xAxis = d3.axisBottom().tickSizeOuter(0)
      yAxis = d3.axisLeft().ticks(5).tickFormat(function (d) {
        return parseFloat(d).toFixed(2) + 'm'
      }).tickSizeOuter(0)
    }

    function updateDimensions () {
      var parentWidth, parentHeight
      margin.top = 25
      margin.bottom = 25
      margin.left = 28
      margin.right = 28

      var xCutOffLeft = d3.timeHour.offset(xExtent[0], +xCutOff).getTime()
      var xCutOffRight = d3.timeHour.offset(xExtent[1], -xCutOff).getTime()

      // Get dimensions based on parent size
      parentWidth = Math.floor(d3.select('#' + containerId).node().getBoundingClientRect().width)
      parentHeight = Math.floor(d3.select('#' + containerId).node().getBoundingClientRect().height)

      // Mobile first
      xAxis.ticks(d3.timeHour, 12).tickFormat(function (d) {
        if (d.getHours() === 12 & d >= xCutOffLeft & d <= xCutOffRight) {
          var formatter = d3.timeFormat('%-e/%-m')
          return formatter(d)
        } else {
          return null
        }
      })

      // Greater than window or svg breakpoint
      if (window.innerWidth > windowBreakPoint && parentWidth > svgBreakPoint) {
        xAxis.ticks(d3.timeHour, 12).tickFormat(function (d) {
          if (d.getHours() === 12 & d.getTime() >= xCutOffLeft & d.getTime() <= xCutOffRight) {
            var formatter = d3.timeFormat('%a, %e %b')
            return formatter(d)
          } else {
            return null
          }
        })
        margin.left = 34
        margin.right = 34
      }
      width = parentWidth - margin.left - margin.right
      height = parentHeight - margin.top - margin.bottom

      // Update x and y scales to new dimensions
      x.range([0, width])
      y.range([height, 0])
      y.nice()

      // Update locator position
      locatorX = Math.floor(x(new Date(dataPointLocator.ts)))
      locatorY = Math.floor(y(dataPointLocator._))
    }

    function updateToolTipBackground () {
      // Set Background size
      var bg = toolTip.select('rect')
      var text = toolTip.select('text')
      var textWidth = text.node().getBBox().width
      var textHeight = text.node().getBBox().height
      text.attr('x', 12).attr('y', 12)
      bg.attr('width', textWidth + 24).attr('height', textHeight + 18)
      var toolTipWidth = bg.node().getBBox().width
      var toolTipHeight = bg.node().getBBox().height
      // Set background left or right position
      var containerWidth = x(xExtent[1])
      if (toolTipX === -1) {
        // Centered in chart
        toolTipX = containerWidth / 2 - (toolTipWidth / 2)
      } else if (toolTipX >= containerWidth - (toolTipWidth + 10)) {
        // On the left
        toolTipX -= (toolTipWidth + 10)
      } else {
        // On the right
        toolTipX += 10
      }
      // Set background above or below position
      if (toolTipY >= toolTipHeight + 10) {
        toolTipY -= toolTipHeight + 10
      } else {
        toolTipY += 10
      }
      toolTipX = toolTipX.toFixed(0)
      toolTipY = toolTipY.toFixed(0)
    }

    function showTooltip (threshold) {
      if (threshold) {
        // Get X and Y pos from threshold
        toolTipX = -1
        toolTipY = y(threshold.level)
        toolTip.select('text').html(threshold.name)
        dataPointLocator = dataPointLatest
      } else {
        // Get X and Y pos from mouse click
        var x0 = x.invert(d3.mouse(this)[0])
        var bisectDate = d3.bisector(function (d) { return new Date(d.ts) }).left
        var i = bisectDate(lines, x0, 1)
        var d0 = lines[i - 1]
        var d1 = lines[i]
        var d = d0
        if (d1) {
          d = x0 - new Date(d0.ts) > x0 - new Date(d1.ts) ? d1 : d0
        }
        dataPoint.ts = d.ts
        dataPoint._ = d._
        toolTipX = x(new Date(dataPoint.ts))
        toolTipY = (d3.mouse(this)[1])
        toolTip.select('text').html(
          '<tspan class="tool-tip-text__strong">' + Number(dataPoint._).toFixed(2) + 'm</tspan>' +
          '<tspan x="12" dy="1.4em">' + parseTime(new Date(dataPoint.ts)).toLowerCase() + ', ' + parseDateShort(new Date(dataPoint.ts)) + '</tspan>')
        // Set locator position
        dataPointLocator = dataPoint
      }

      // Update locator location
      locatorX = Math.floor(x(new Date(dataPointLocator.ts)))
      locatorY = Math.floor(y(dataPointLocator._))
      var latestX = Math.floor(x(new Date(dataPointLatest.ts)))
      locator.classed('locator--offset', true)
      locator.classed('locator--forecast', locatorX > latestX)
      locator.attr('transform', 'translate(' + locatorX + ',' + 0 + ')')
      locator.select('.locator-point').attr('transform', 'translate(' + 0 + ',' + locatorY + ')')

      // Update tooltip left/right background
      updateToolTipBackground()

      // Update tooltip location
      toolTip.attr('transform', 'translate(' + toolTipX + ',' + toolTipY + ')')
      toolTip.classed('tool-tip--visible', true)
    }

    function hideTooltip () {
      toolTip.classed('tool-tip--visible', false)
      // Update locator location
      locatorX = Math.floor(x(new Date(dataPointLatest.ts)))
      locatorY = Math.floor(y(dataPointLatest._))
      locator.classed('locator--offset', false)
      locator.classed('locator--forecast', false)
      locator.attr('transform', 'translate(' + locatorX + ',' + 0 + ')')
      locator.select('.locator-point').attr('transform', 'translate(' + 0 + ',' + locatorY + ')')
    }

    this.removeThreshold = function (id) {
      thresholds = thresholds.filter(function (x) { return x.id !== id })
      svg.select('.threshold--' + id).remove()
      modifyAxis()
      render()
    }

    this.addThreshold = function (threshold) {
      threshold.isSelected = true
      thresholds.forEach(x => { x.isSelected = false })
      var foundThreshold = thresholds.find(function (x) {
        return x.id === threshold.id
      })
      if (foundThreshold) {
        thresholds = thresholds.filter(function (x) {
          return x.id !== threshold.id
        })
      }
      thresholds.push(threshold)
      // Show tooltip
      modifyAxis()
      updateDimensions()
      render()
    }

    // Events
    window.addEventListener('resize', render)

    this.chart = chart
  }

  charts.createLineChart = function (containerId, data) {
    return new LineChart(containerId, data)
  }

  flood.charts = charts
})(window, window.flood)
