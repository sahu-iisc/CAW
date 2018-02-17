var w=window,
dw=document,
ew=dw.documentElement,
gw=dw.getElementsByTagName('body')[0]

var window_width = w.innerWidth||ew.clientWidth||gw.clientWidth

var width = (window_width<600)?window_width*0.95:600, height= width*0.85, margin={left:10, right:10, top: 5, bottom: 5}
var desktop_width = 300, desktop_height= 280

var projection = d3.geoMercator();
var bjp_strong = [75], congress_strong = [138, 132, 130, 139]
var anti_incumbency = [15, 37, 38, 97, 109, 122, 145]
var in_2017_anti = [67,91, 90, 15, 32, 140, 122]
var buckets = [0,'1',10, 20, 30, 40, '100%']

var path = d3.geoPath()
        .projection(projection);



d3.queue()
.defer(d3.csv, "all_data.csv")
.defer(d3.json, "gujarat_all_geo.json")
.await(ready);

var start_year = 1976
var end_year = 2008

function ready(error, data, geo){

        var party_colors = {
                    'BJP':'red',
                    'INC':'steelblue',
                    'INC(I)':'steelblue',
                    "State":'#3a3a3a'
                }

        var party_name = {
                    'BJP':'BJP',
                    'INC':'Congress',
                    'INC(I)':'Congress (Indira)',
                    'IND':'Independent',
                    'JD':'Janata Dal',
                    'JNP':'Janata Party'
                }



        var byYear = d3.nest()
            .key(function(d){
                return d.Year
            })
            .entries(_.filter(data,function(d){
                return (d.Year>=start_year)
            }))

        var colors = ['#ffe6e6','#ffbaba','#ff7b7b','#ff5252','#ff0000','#a70000']

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

        var boundary = centerZoom(geo,'gujarat_2008');
        // drawOuterBoundary(boundary);
        function drawSubUnits(unit){
            console.log(unit);
            if (unit.key<=end_year){
                layer='gujarat_2002'
            } else {
                layer='gujarat_2008'
            }

            d3.select('.y-'+unit.key)
                .selectAll(".subunit")
                .data(topojson.feature(geo, geo.objects[layer]).features)
                .enter().append("path")
                .attr("class", function(d){ return "subunit g-ac-"+ d.properties.ac_no})
                .attr("d", path)
                .attr('fill', function(d){
                    if (d.properties.ac_no!=0){
                        var obj = _.filter(data, function(e){
                            return (+e['Constituency_No'] == +d.properties.ac_no) && (+e['Year'] == +unit.key) && e.Position=='1'
                        })

                        return getColor(obj[0].Margin_Percentage)
                    } else {
                        return '#fff'
                    }
                })
                .on('mouseover',function(d){
                    var obj = _.filter(data, function(e){
                            return (+e['Constituency_No'] == +d.properties.ac_no) && (+e['Year'] == +unit.key) && e.Position=='1'
                        })[0]
                    if (d.properties.ac_no!=0){
                        mapTipOn(d.properties.ac_no,+unit.key,obj)
                    }
                })
                .on('mouseout',function(d){
                    mapTipOff()
                })

        } // end drawSubunits();

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

            if (value<=1){
                return colors[0]
            } else if (value<=10){
                return colors[1]
            } else if (value<=20){
                return colors[2]
            } else if (value<=30){
                return colors[3]
            } else if (value<=40){
                return colors[4]
            } else if (value<=100){
                return colors[5]
            } else {
               return colors[0]
            }
        }

        
        d3.select('.viz h2')
            .style('display','none')
        
      

        // This function "centers" and "zooms" a map by setting its projection's scale and translate according to its outer boundary
        // It also returns the boundary itself in case you want to draw it to the map
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

        //   function drawOuterBoundary(boundary){
        //     g.append("path")
        //         .datum(boundary)
        //         .attr("d", path)
        //         .attr("class", "subunit-boundary");
        //   }

          // histogram code 
         
            
            // initalize the tip
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
                    var rect_class = ".ysvg-"+year+" .g-ac-" + ac;
                        d3.selectAll( ".g-ac-" + ac).classed("selected", true).moveToFront();
                   
                    tip.select(".title")
                        .html(function(){
                            if (+d.Margin_Percentage){
                                return (d.Party!='IND')?(toTitleCase(d.Candidate)+' of <span>'+(party_name[d.Party]?party_name[d.Party]:d.Party)+'</span> won <span>'+toTitleCase(d.Constituency_Name)+'</span> with a margin of <span>'+d.Margin_Percentage+'% votes.</span>'):('Independent candidate '+toTitleCase(d.Candidate)+' won <span>'+toTitleCase(d.Constituency_Name)+'</span> with a margin of <span>'+d.Margin_Percentage+'% votes.</span>')
                            }
                    });

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
        } // ready ends

       
        function toTitleCase(str){
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }

        // function slugify(text){
        //   return text.toString().toLowerCase()
        //     .replace(/\s+/g, '-')           // Replace spaces with -
        //     .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        //     .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        //     .replace(/^-+/, '')             // Trim - from start of text
        //     .replace(/-+$/, '');            // Trim - from end of text
        // }

        // function roundNum(num, decimals) {
        //     return parseFloat(Math.round(num * 100) / 100).toFixed(decimals);
        // }
        // switch to 2012 ends

        // d3 webpack functions

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

      d3.wordwrap = function(line, maxCharactersPerLine, gap) {

          var w = line.split(' '),
              lines = [],
              words = [],
              maxChars = maxCharactersPerLine || 40,
              l = 0;
          w.forEach(function(d) {
              if (l+d.length > maxChars) {
                  lines.push(words.join(' '));
                  words.length = 0;
                  l = 0;
              }
              l += d.length;
              words.push(d);
          });
          if (words.length) {
              lines.push(words.join(' '));
          }
          return ((gap)? (lines,gap): lines)
      };
