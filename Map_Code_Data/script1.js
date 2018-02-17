var w=window,
dw=document,
ew=dw.documentElement,
gw=dw.getElementsByTagName('body')[0]

var window_width = w.innerWidth||ew.clientWidth||gw.clientWidth

var width = (window_width<600)?window_width*0.95:600, height= width*0.85, margin={left:10, right:10, top: 5, bottom: 5}
var desktop_width = 300, desktop_height= 280

var projection = d3.geoMercator();
var buckets = [10,30,50,70,90,110,130,150]

var path = d3.geoPath()
        .projection(projection);

d3.queue()
.defer(d3.csv, "Crime_2011.csv")
.defer(d3.json, "test.json")
.defer(d3.json, "India_telagana.topojson")
.await(ready);

var start_year = 2011
var end_year = 2013

function ready(error, data, geo, geo1){
let byYear = d3.nest()
.key(function(d){
    return d.Year
})
.entries(data)
var colors = ['#ffe6e6','#ffb3b3','#ff8080','#ff4d4d','#ff1a1a','#e60000','#b30000','#800000']

var years = d3.select('#map-choropleth .viz')
.selectAll("div")
.data(byYear)
.enter()
.append('div')
.attr('class',function(d){
    return 'desktop-year ysvg-'+d.key
})
years.append('p')
.attr('class','year-label')
.text(function(d){
return d.key
})

var effective_height = window_width<600?height:desktop_height
var effective_width = window_width<600?width:desktop_width

var g = years.append('svg')
    .attr('height',effective_height)
    .attr('width',effective_width)
    .append('g')
    .attr('class',function(d){
        return 'y-'+d.key
    })
let rate = 0;
    var boundary = centerZoom(geo,'india');
    function drawSubUnits(unit){
        if(end_year>=unit.key){
        d3.select('.y-'+unit.key)
            .selectAll(".subunit")
            .data(topojson.feature(geo, geo.objects['india']).features)
            .enter().append("path")
            .attr("class", function(d){ return "subunit g-ac-"+ d.properties.NAME_1.replace(/\s/g, '')})
            .attr("d", path)
            .attr('fill', function(data, e){
                for(let i = 0;i < 36;i++){
                if(unit.values[i].States==data.properties.NAME_1.toUpperCase())
                        return getColor((unit.values[i].Rate_of_Cognizable_Crime))
                }      
                })
            .on('mouseover',function(d){
                for(let i = 0;i < 34;i++){
                if(unit.values[i].States==d.properties.NAME_1.toUpperCase())
                       rate = unit.values[i].Case_Reported
            }      
        
                    mapTipOn(d.properties.NAME_1,+unit.key,rate)
            })
            .on('mouseout',function(d){
                mapTipOff()
            })
        }
        else{
            d3.select('.y-'+unit.key)
            .selectAll(".subunit")
            .data(topojson.feature(geo1, geo1.objects['India_telagana']).features)
            .enter().append("path")
            .attr("class", function(d){return "subunit g-ac-"+ d.properties.NAME_1.replace(/\s/g, '')})
            .attr("d", path)
            .attr('fill', function(data, e){
                for(let i = 0;i < 36;i++){
                if(unit.values[i].States==data.properties.NAME_1)
                        return getColor((unit.values[i].Rate_of_Cognizable_Crime))
                }      
                })
            .on('mouseover',function(d){
                for(let i = 0;i < 36;i++){
                if(unit.values[i].States==d.properties.NAME_1)
                       rate = unit.values[i].Case_Reported
            }      
        
                    mapTipOn(d.properties.NAME_1,+unit.key,rate)
            })
            .on('mouseout',function(d){
                mapTipOff()
            })
        } 
        
           
    }

    d3.selectAll('.desktop-year').each(function(d){
        drawSubUnits(d)
    })

    d3.select('.legend')
        .append('p')
        .text('Rate of cognizable crime (in %)')

    d3.select('.legend')
        .append('div')
        .attr('class','legend-box-container')
        .selectAll('.legend-boxes')
        .data(colors)
        .enter()
        .append('div')
        .attr('class','legend-boxes')
        .style('background-color',function(d){
            return d
        })

    d3.select('.legend')
        .append('div')
        .attr('class','legend-label-container')
        .selectAll('.legend-labels')
        .data(buckets)
        .enter()
        .append('p')
        .attr('class','legend-labels')
        .text(function(d){
            return d
        })

    function getColor(value){
        if (value<=10){
            return colors[0]
        } else if (value<=30){
            return colors[1]
        } else if (value<=50){
            return colors[2]
        } else if (value<=70){
            return colors[3]
        } else if (value<=90){
            return colors[4]
        } else if (value<=110){
            return colors[5]
        } else if (value<=130){
            return colors[6]
        } else if (value<=150){
            return colors[7]
        } else {
           return colors[0]
        }
    }

        
    d3.select('.viz h2')
    .style('display','none')

    function centerZoom(data, selected){
        var o = topojson.mesh(data, data.objects[selected], function(a, b) { return a === b; });

        projection
            .scale(1)
            .translate([0, 0]);

        var b = path.bounds(o),
            s = 1 / Math.max((b[1][0] - b[0][0]) / effective_width, (b[1][1] - b[0][1]) / effective_height),
            t = [(effective_width - s * (b[1][0] + b[0][0])) / 2, (effective_height - s * (b[1][1] + b[0][1])) / 2];

        projection
            .scale(s)
            .translate(t);

        return o;
      }

      var tip = d3.select("body").append("div")
                .attr("class", "tip");
            tip.append("div")
                .attr("class", "close-tip");
            tip.append("div")
                .attr("class", "title");

           
            function mapTipOff(){
                d3.selectAll("path").classed("selected", false);
                d3.select(".tip")
                    .style("opacity", 0)
                    .style("left", "-1000px")
                    .style("top", "-1000px");
            }

            function mapTipOn(ac, year,d){
                    var rect_class = ".ysvg-"+year+" .g-ac-" + ac.replace(/\s/g,'');
                        d3.selectAll( ".g-ac-" + ac).classed("selected", true).moveToFront();
                    tip.select(".title")
                        .html(ac +" No. of crimes "+ d);

                    tip.select(".close-tip")
                        .html("<i class='fa fa-times' aria-hidden='true'></i>");

                    // position

                    var media_pos = d3.select(rect_class).node().getBoundingClientRect();
                    var tip_pos = d3.select(".tip").node().getBoundingClientRect();
                    var tip_offset = 5;
                    var window_offset = window.pageYOffset;
                    var window_padding = 40;

                    var left = (media_pos.left - tip_pos.width / 2);
                    left = left < 0 ? media_pos.left :
                        left + tip_pos.width > window_width ? media_pos.left - tip_pos.width :
                        left;

                    var top = window_offset + media_pos.top - tip_pos.height - tip_offset;
                    top = top < window_offset + window_padding ? window_offset + media_pos.top + media_pos.height + tip_offset :
                        top;
                    
                    d3.select(".tip")
                        .style("opacity", .98)
                        .style("left", left + "px")
                        .style("top", top + "px");
                }
        } 
        d3.selection.prototype.tspans = function(lines, lh) {

            return this.selectAll('tspan')
                .data(lines)
                .enter()
                .append('tspan')
                .text(function(d) { return d; })
                .attr('x', 0)
                .attr('dy', function(d,i) { return i ? lh || 10 : 0; });
        };
  
        d3.selection.prototype.moveToFront = function() {  
        return this.each(function(){
          this.parentNode.appendChild(this);
        });
          };
          d3.selection.prototype.moveToBack = function() {  
              return this.each(function() { 
                  var firstChild = this.parentNode.firstChild; 
                  if (firstChild) { 
                      this.parentNode.insertBefore(this, firstChild); 
                  } 
              });
          };
  
          function toTitleCase(str){
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }
      