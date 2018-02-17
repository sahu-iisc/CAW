queue()
.defer(d3.csv, "Crime_total.csv")
.await(ready1);

function ready1(error, data){
var causes = ["2011", "2012", "2013", "2014", "2015","2016"];


var margin = {top: 50, right: 50, bottom: 30, left: 70},
    width = document.documentElement.clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width]);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var z =  d3.scale.ordinal()
    .range(['#ff8080','#ff4d4d','#ff1a1a','#e60000','#b30000','#800000']);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(20,"s");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    data.forEach(type);


  var columnHeaders = d3.keys(data[0]).filter(function(key) { return key !== "state" && key !== "code"; });
  var layers = d3.layout.stack()(causes.map(function(c) {
    return data.map(function(d) {
      return {x: d.code, y: d[c]};
    });
  }));



  x.domain(layers[0].map(function(d) { return d.x; }));
  y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();

  var layer = svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return z(i); });

  layer.selectAll("rect")
      .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y + d.y0); })
      .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
      .attr("width", x.rangeBand() - 1)
        .style("cursor","pointer");
  var tip1 = d3.tip()
  .attr('class', 'd3-tip1')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Cases Reported in "+d.x+" "+":</strong> <span style='color:red'>" + d.y + "</span>";
  });

svg.call(tip1);
        layer.selectAll("rect")
            .on("mouseenter",tip1.show)
            .on("mouseleave",tip1.hide);
  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate( 0,0)")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("dy", ".91em")
      .style("text-anchor", "end")
      .text("No. of Crimes");
var legend = svg.selectAll(".legend")
      .data(z.domain().slice().reverse())
      .enter().append("g")
      .attr("class","legend")
      .attr("transform", function(d, i) {
          return "translate(0," + i * 20 + ")";
      });
      columnHeaders.reverse();
      legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", z);
 
            legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d,i) {
                return columnHeaders[i];
            });
            function type(d) {
                causes.forEach(function(c) {
                    d[c] = +d[c]; });
                return d;
              }
        }

