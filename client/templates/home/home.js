Template.home.rendered = function() {
  var margin = 20,
    width = 700 - margin,
    height = 300 - margin;

  function drawRecessions(recessions, elem, date_parse, x, y) {
    elem.selectAll("rect")
      .data(recessions)
      .enter()
      .append("rect")
      .attr("x", function (d, i) {
        // var width = x(d.troughDate) - x(d.peakDate);
        //return i + width;
        if (!d.peakDate) {
          d.peakDate = date_parse(d.peak);
          d.troughDate = date_parse(d.trough);
        }
        if (isNaN(x(d.peakDate))) {
          return 0;
        } else {
          return x(d.peakDate);
        }
      })
      .attr("y", margin)
      .attr("width", function (d) {
        if (!d.peakDate) {
          d.peakDate = date_parse(d.peak);
          d.troughDate = date_parse(d.trough);
        }
        var start_x = x(d.peakDate);
        if (isNaN(start_x) || start_x < margin) {
          return 0;
        } else {
          return x(d.troughDate) - start_x;
        }
      })
      .attr("height", height - margin)
      .attr("fill", "grey")
      .attr("opacity", 0.3);
  }

  function drawBullBearRanges(elem, bullRange, bearRange, x, y) {
    appendRange(elem.selectAll("rect")
      .data([null])
      .enter(), bullRange, "LightGreen", x, y);
    appendRange(elem, bearRange, "pink", x, y);

  }

  function appendRange(elem, range, color, x, y) {
    elem.append("rect")
      .attr("y", function (d, i) {
        return y(range[1]);
      })
      .attr("x", margin)
      .attr("width", width - margin)
      .attr("height", function (d) {
        return y(range[0]) - y(range[1]);
      })
      .attr("fill", color)
      .attr("opacity", 0.3);
  }

  function draw(data, elemId, latestElemId, date_parse, bearRange, bullRange, latest) {
    data.forEach(function(d) {
      d.date = date_parse(d.date);
    });

    var extent = d3.extent(data,function (d) {return parseFloat(d.value);});

    var y= d3.scale.linear()
      .domain(extent[0] <= 0 ? extent : [0, extent[1]])
      .range([height,margin]);

    var x = d3.time.scale()
      .domain([data[0].date, data[data.length - 1].date])
      .range([margin,width]);

    var y_axis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var x_axis = d3.svg.axis()
      .scale(x);

    var line = d3.svg.line()
      .x(function (d) {return x(d.date);})
      .y(function (d) {return y(d.value);});

    var zeroline = d3.svg.line()
      .x(function (d) {return x(d.date);})
      .y(function (d) {return y(0);});

    d3.select(elemId).select("svg")
      .remove();

    d3.select(elemId)
      .append("svg")
      .attr("class","chart")
      .attr("width", width+margin)
      .attr("height", height+margin);

    var e = d3.select(elemId).select("svg");

    d3.json("/recessions.json", function(data){
      var parse = d3.time.format("%Y-%m-%d").parse;
      drawRecessions(data, e, parse, x, y);
    });

    if (typeof bearRange !== 'undefined' && typeof bullRange !== 'undefined') {
      drawBullBearRanges(e, bearRange, bullRange, x, y);
    }

    e.append("path")
      .attr("class", "line");

    function addpoints(k) {
      e.select("path")
        .attr("d", function() { return line(data.slice(0, k + 1)); });
    };

    var k = 1, n = data.length, interval = Math.max(1,Math.round(n/50));
    d3.timer(function() {
      addpoints(k);
      if ((k += interval) >= n - 1) {
        addpoints(n - 1);
        return true;
      }
    });

    if (d3.min(data,function (d) {return parseFloat(d.value);}) < 0) {
      d3.select(elemId).select("svg")
        .append("path")
        .attr("class", "line")
        .style("stroke", "gray")
        .style("opacity", "1.0")
        .attr("d", zeroline(data));
    }

    d3.select(elemId).select("svg")
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      //.attr("transform", "translate(0," + (height + margin)/2 + ")")
      .call(x_axis);

    d3.select(elemId).select("svg")
      .append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margin + ",0)")
      .call(y_axis);

    d3.select('.y.axis')
      .append('text')
      //.text('Y Axis Label')
      .attr('transform', "rotate (90, " + -margin + ", 0)")
      .attr('x', 90)
      .attr('y', 0);

    if (latest && typeof latest !== 'undefined') {
      // console.log("As of " + latest.date + ": " + latest.value);
      d3.select(latestElemId)
        .append('text')
        .text("Last updated "  + latest.date + " (" + Math.round(latest.value * 100) / 100 + ")");
    }
  }
  function getData(sym, elemId, latestElemId, bullRange, bearRange) {
    var path = 'fred?sym=' + sym;
    var parse = d3.time.format("%Y-%m-%d").parse;
    if (sym === 'sp_pe10') {
      path = sym + '.json';
      parse = d3.time.format("%Y.%m").parse;
    }

    d3.json("/" + path, function(data){
      draw(data.observations, elemId, latestElemId, parse, bullRange, bearRange, data.latest);
    });
  }

  getData("sp_pe10", "#sp-pe10", "#latest-sp-pe10", [0,10], [20,45]);

};
