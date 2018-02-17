d3.queue()
.defer(d3.csv, "Crime_total.csv")
.await(ready1);

function ready1(error, data){
var causes = ["2011", "2012", "2013", "2014", "2015","2016"];


var margin = {top: 50, right: 50, bottom: 30, left: 70},
    width = document.documentElement.clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var x = d3.scaleBand()
        .range([0, width], .1);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);


    var color = d3.scaleOrdinal()
        .range(['#ff8080','#ff4d4d','#ff1a1a','#e60000','#b30000','#800000']);

    var xAxis = d3.axisBottom()
        .scale(x);

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(10,"s");

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var active_link = "0"; //to control legend selections and hover
    var legendClicked; //to control legend selections
    var legendClassArray = []; //store legend classes to select bars in plotSingle()
    var legendClassArray_orig = []; //orig (with spaces)
    var sortDescending; //if true, bars are sorted by height in descending order
    var restoreXFlag = false; //restore order of bars back to original


    //disable sort checkbox
    d3.select("label")
        .select("input")
        .property("disabled", true)
        .property("checked", false);

    color.domain(d3.keys(data[0]).filter(function(key) {
        return (key !== "state" && key !== "code");
    }));

    data.forEach(function(d) {
        var mystate = d.code; //add to stock code
        var y0 = 0;
        //d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.crime = color.domain().map(function(name) {
            //return { mystate:mystate, name: name, y0: y0, y1: y0 += +d[name]}; });
            return {
                mystate: mystate,
                fullstate: d.state,
                name: name,
                y0: y0,
                y1: y0 += +d[name],
                value: d[name],
                y_corrected: 0
            };
        });
        d.total = d.crime[d.crime.length - 1].y1;
    });

    //Sort totals in descending order
    data.sort(function(a, b) {
        return b.total - a.total;
    });

    x.domain(data.map(function(d) {
        return d.code;
    }));
    y.domain([0, d3.max(data, function(d) {
        return d.total;
    })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");
    //.text("Population");

    var state = svg.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) {
            return "translate(" + "0" + ",0)";
        });
    //.attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; })

    height_diff = 0; //height discrepancy when calculating h based on data vs y(d.y0) - y(d.y1)
    state.selectAll("rect")
        .data(function(d) {return d.crime;})
        .enter().append("rect")
        .attr("width", x.bandwidth()-2)
        .attr("y", function(d) {
            height_diff = height_diff + y(d.y0) - y(d.y1) - (y(0) - y(d.value));
            y_corrected = y(d.y1) + height_diff;
            d.y_corrected = y_corrected //store in d for later use in restorePlot()

            if (d.name === "2016") height_diff = 0; //reset for next d.mystate

            return y_corrected;
            // return y(d.y1);  //orig, but not accurate  
        })
        .attr("x", function(d) { //add to stock code
            return x(d.mystate)
        })
        .attr("height", function(d) {
            //return y(d.y0) - y(d.y1); //heights calculated based on stacked values (inaccurate)
            return y(0) - y(d.value); //calculate height directly from value in csv file
        })
        .attr("class", function(d) {
            classLabel = d.name; //remove spaces
            return "bars class" + classLabel;
        })
        .style("fill", function(d) {
            return color(d.name);
        });
        var tip1 = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<strong>Cases Reported in <br> "+d.fullstate+" in "+ d.name+":</strong> <span style='color:red'>" + d.value + "</span>";
        });

       
        svg.call(tip1);

    state.selectAll("rect")
        .on("mouseenter", tip1.show)
        .on("mouseleave", tip1.hide);


       
        
    var legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", function(d) {

            legendClassArray.push(d); //remove spaces
            legendClassArray_orig.push(d); //remove spaces
            return "legend";
        })
        .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });


    //reverse order to match order in which bars are stacked    
    legendClassArray = legendClassArray.reverse();
    legendClassArray_orig = legendClassArray_orig.reverse();

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color)
        .attr("id", function(d, i) {
            return "id" + d;
        })
        .on("mouseover", function() {

            if (active_link === "0") d3.select(this).style("cursor", "pointer");
            else {
                if (active_link.split("class").pop() === this.id.split("id").pop()) {
                    d3.select(this).style("cursor", "pointer");
                } else d3.select(this).style("cursor", "auto");
            }
        })
        .on("click", function(d) {

            if (active_link === "0") { //nothing selected, turn on this selection
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", 2);

                active_link = this.id.split("id").pop();
                plotSingle(this);

                //gray out the others
                for (i = 0; i < legendClassArray.length; i++) {
                    if (legendClassArray[i] != active_link) {
                        d3.select("#id" + legendClassArray[i])
                            .style("opacity", 0.5);
                    } else sortBy = i; //save index for sorting in change()
                }

                //enable sort checkbox
                d3.select("label").select("input").property("disabled", false)
                d3.select("label").style("color", "black")
                //sort the bars if checkbox is clicked            
                d3.select("input").on("change", change);

            } else { //deactivate
                if (active_link === this.id.split("id").pop()) { //active square selected; turn it OFF
                    d3.select(this)
                        .style("stroke", "none");

                    //restore remaining boxes to normal opacity
                    for (i = 0; i < legendClassArray.length; i++) {
                        d3.select("#id" + legendClassArray[i])
                            .style("opacity", 1);
                    }


                    if (d3.select("label").select("input").property("checked")) {
                        restoreXFlag = true;
                    }

                    //disable sort checkbox
                    d3.select("label")
                        .style("color", "#D8D8D8")
                        .select("input")
                        .property("disabled", true)
                        .property("checked", false);


                    //sort bars back to original positions if necessary
                    change();

                    //y translate selected category bars back to original y posn
                    restorePlot(d);

                    active_link = "0"; //reset
                }

            } //end active_link check


        });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {
            return d;
        });

    // restore graph after a single selection
    function restorePlot(d) {
        //restore graph after a single selection
        d3.selectAll(".bars:not(.class" + class_keep + ")")
            .transition()
            .duration(1000)
            .delay(function() {
                if (restoreXFlag) return 3000;
                else return 750;
            })
            .attr("width", x.bandwidth()-2) //restore bar width
            .style("opacity", 1);

        //translate bars back up to original y-posn
        d3.selectAll(".class" + class_keep)
            .attr("x", function(d) {
                return x(d.mystate);
            })
            .transition()
            .duration(1000)
            .delay(function() {
                if (restoreXFlag) return 2000; //bars have to be restored to orig posn
                else return 0;
            })
            .attr("y", function(d) {
                //return y(d.y1); //not exactly correct since not based on raw data value
                return d.y_corrected;
            });

        //reset
        restoreXFlag = false;

    }

    // plot only a single legend selection
    function plotSingle(d) {

        class_keep = d.id.split("id").pop();
        idx = legendClassArray.indexOf(class_keep);
    
        //erase all but selected bars by setting opacity to 0
        d3.selectAll(".bars:not(.class" + class_keep + ")")
              .transition()
              .duration(1000)
              .attr("width", 0) // use because svg has no zindex to hide bars so can't select visible bar underneath
              .style("opacity", 0);
    
    
        var state = d3.selectAll(".g");
    
        state.nodes().forEach(function(d, i) {
                    var nodes = d.childNodes;
            //get height and y posn of base bar and selected bar
            h_keep = d3.select(nodes[idx]).attr("height");
            y_keep = d3.select(nodes[idx]).attr("y");
    
            h_base = d3.select(nodes[0]).attr("height");
            y_base = d3.select(nodes[0]).attr("y");
    
            h_shift = h_keep - h_base;
            y_new = y_base - h_shift;
    
       d3.select(nodes[idx])
         .transition()
         .ease(d3.easeQuadIn)
         .duration(500)
         .delay(750)
         .attr("y", y_new);
    
    
    
    });
    
    
      }
    //adapted change() fn in http://bl.ocks.org/mbostock/3885705
    function change() {

        if (this.checked) sortDescending = true;
        else sortDescending = false;

        colName = legendClassArray_orig[sortBy];

        var x0 = x.domain(data.sort(sortDescending ?
                    function(a, b) {
                        return b[colName] - a[colName];
                    } :
                    function(a, b) {
                        return b.total - a.total;
                    })
                .map(function(d, i) {
                    return d.code;
                }))
            .copy();

        state.selectAll(".class" + active_link)
            .sort(function(a, b) {
                return x0(a.mystate) - x0(b.mystate);
            });

        var transition = svg.transition().duration(750),
            delay = function(d, i) {
                return i * 20;
            };

        //sort bars
        transition.selectAll(".class" + active_link)
            .delay(delay)
            .attr("x", function(d) {
                return x0(d.mystate);
            });

        //sort x-labels accordingly    
        transition.select(".x.axis")
            .call(xAxis)
            .selectAll("g")
            .delay(delay);


        transition.select(".x.axis")
            .call(xAxis)
            .selectAll("g")
            .delay(delay);
        }

        function barClicked() {
            modalOpened(this.__data__);
        }

        function modalOpened(d) {
            //console.log(d);
            setConText(d.mystate, d.fullstate, parseInt(d.name, 10));
            $("#modal-content").modal('show');
        }
    }