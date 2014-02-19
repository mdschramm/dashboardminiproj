(function ($) {
    $.fn.mutRefGraph = function(options) {
        var mainThis = this;
        var settings = $.extend({
            data: 'mut.a[1-],mut.g[1-],ref.C[71+|72-]',
            maxCoverage: 150,
            barPadding: 10,
            valueLabelHeight: 12,
            bottomPadding: 20,
            graphHeight: 100,
            graphWidth: 200,
            }, options);
        return this.each(function() {
            parseToGraph(settings.data);
            function parseToGraph(toParse) {
                var graphObjects = [{"base":"A","type":"ref","value":0,"plus":0,"minus":0},
                                    {"base":"G","type":"ref","value":0,"plus":0,"minus":0},
                                    {"base":"C","type":"ref","value":0,"plus":0,"minus":0},
                                    {"base":"T","type":"ref","value":0,"plus":0,"minus":0}];
                var toParseArray = [];
                separateByCommas(toParse, toParseArray);
                fillObjectArray(graphObjects, toParseArray);
                graphGraphObject(graphObjects);
            } 
            
            function separateByCommas(str, arr) {
                var comma = str.indexOf(',');
                if(comma == -1) {
                    arr.push(str);
                } else {
                    arr.push(str.substring(0,comma));
                    str = str.substring(comma+1);
                    separateByCommas(str, arr);
                    }
            }
            
            function fillObjectArray(objArr, filledArr) {
                var usedBaseTypes = [];
                for(var i=0; i<filledArr.length; i++) {
                    var elem = filledArr[i];
                    var period = elem.indexOf('.');
                    if(usedBaseTypes.indexOf(elem.charAt(period + 1).toUpperCase() + elem.substring(0, period)) == -1){
                        var obj = {"base": elem.charAt(period + 1).toUpperCase(), "type": elem.substring(0, period)};    
                        usedBaseTypes.push(obj["base"] + obj["type"]);
                        if(elem.indexOf('|') != -1) {
                            obj["value"] = parseInt(elem.substring(elem.indexOf('[') + 1, elem.indexOf('|') - 1)) + parseInt(elem.substring(elem.indexOf('|') + 1, elem.indexOf(']') - 1));
                            obj["plus"] = parseInt(elem.substring(elem.indexOf('[') + 1, elem.indexOf('+')));
                            obj["minus"] = parseInt(elem.substring(elem.indexOf('|') + 1, elem.indexOf('-')));
                        } else {
                            obj["value"] = parseInt(elem.substring(elem.indexOf('[') + 1, elem.indexOf(']') - 1));
                            if(elem.charAt(elem.indexOf(']') - 1) == '+') {
                                obj["plus"] = parseInt(elem.substring(elem.indexOf('[') + 1, elem.indexOf('+')));
                                obj["minus"] = 0;
                            } else {
                                obj["plus"] = 0;
                                obj["minus"] = parseInt(elem.substring(elem.indexOf('[') + 1, elem.indexOf('-')));
                            }
                        }
                        switch(obj["base"]) {
                            case "A":
                                objArr[0] = obj;
                                break;
                            case "G":
                                objArr[1] = obj;
                                break;
                            case "C":
                                objArr[2] = obj;
                                break;
                            case "T":
                                objArr[3] = obj;
                                break;
                            default:
                                objArr.push(obj);
                                break;
                        }
                    } else {
                        for(var j=0; j<objArr.length; j++) {
                            var elem1 = objArr[j];
                            if(elem1["base"] == elem.charAt(period + 1).toUpperCase() && elem1["type"] == elem.substring(0, period)) {
                                if(elem.indexOf('|') != -1) {
                                    elem1["value"] += parseInt(elem.substring(elem.indexOf('[') + 1, elem.indexOf('|') - 1)) + parseInt(elem.substring(elem.indexOf('|') + 1, elem.indexOf(']') - 1));
                                    elem1["plus"] += parseInt(elem.substring(elem.indexOf('[') + 1, elem.indexOf('+')));
                                    elem1["minus"] += parseInt(elem.substring(elem.indexOf('|') + 1, elem.indexOf('-')));
                                } else {
                                    elem1["value"] += parseInt(elem.substring(elem.indexOf('[') + 1, elem.indexOf(']') - 1));
                                    if(elem.charAt(elem.indexOf(']') - 1) == '+') {
                                        elem1["plus"] += parseInt(elem.substring(elem.indexOf('[') + 1, elem.indexOf('+')));
                                    } else {
                                        elem1["minus"] += parseInt(elem.substring(elem.indexOf('[') + 1, elem.indexOf('-')));
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            function graphGraphObject(filledObjArr) {
                var w = settings.graphWidth;
                var h = settings.graphHeight;
                var bottomPadding = settings.bottomPadding;
                var barPadding = settings.barPadding;
                var valueLabelHeight = settings.valueLabelHeight;
                var maxCoverage = settings.maxCoverage;
        // Not a pretty way to get the d3 array subclass that has all of the methods that I need, but there doesn't seem to be
        // a way to .select(mainThis), or just use mainThis, because these will not return the special d3 array.
                mainThis.addClass("TempClassForSelection");
                var svg = d3.select(".TempClassForSelection")
                            .append("svg")
                            .attr("width", w)
                            .attr("height", h);
                mainThis.removeClass("TempClassForSelection");
                var x = d3.scale.linear().domain([0, 4]).range([0, w]);
                var y = d3.scale.linear().domain([0, maxCoverage]).range([h, 0]);
                var xAxis = d3.svg.axis().ticks(0).scale(x).tickSize(0);
                xAxisYLoc = h - bottomPadding + 2;
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + xAxisYLoc + ")") 
                    .call(xAxis);
              /*  var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(-10, 0)")
                    .call(yAxisLeft); */
                for(var i=0; i<filledObjArr.length; i++) {
                    var d = filledObjArr[i];
                    var barLabel = d["base"];
                    var barValue = d["value"]*(h - bottomPadding)/maxCoverage; 
                    var barPlus = d["plus"];
                    var barMinus = d["minus"];
                    mainThis.addClass("tempclass");
                    var tooltip = d3.select(".tempclass")
                                    .append("div")
                                    .style("position", "absolute")
                                    .style("z-index", "10")
                                    .style("visibility", "hidden")
                                    .style("background-color","black")
                                    .style("color", "white")
                                    .style("padding", "1px");
                    if(d["type"] == "ref") {
                        svg.append("rect")
                            .attr("y", h - barValue - bottomPadding)
                            .attr('height', barValue)
                            .attr('width', w / 4 - barPadding)
                            .attr('x', x(i))
                            .attr('fill', 'green')
                            .attr('barplus', barPlus)
                            .attr('barminus', barMinus)
                            .on("mouseover", function() {
                                        return tooltip.style("visibility","visible").text($(this).attr('barplus') + "+ " + $(this).attr('barminus') + "- ");
                                    })
                            .on("mousemove", function(){
                                    var yoffset = parseInt($(this).attr('barplus')) + parseInt($(this).attr('barminus')) > 40 ? $(this).offset().top - 60 : $(this).offset().top - 75;
                                    if(parseInt($(this).attr('barplus')) + parseInt($(this).attr('barminus')) > settings.maxCoverage*1.5) {
                                    var difference = parseInt($(this).attr('barplus')) + parseInt($(this).attr('barminus')) - settings.maxCoverage*1.5;
                                    yoffset = $(this).offset().top + difference/3;
                                    } 
                                    var xoffset = $(this).offset().left - 280;
                                    return tooltip.style("top", yoffset + "px").style("left", xoffset +"px");})
                            .on("mouseout", function() {
                                        return tooltip.style("visibility","hidden");
                                        });
                    } else {
                        svg.append("rect")
                            .attr("y", h - barValue - bottomPadding)
                            .attr('height', barValue)
                            .attr('width', w / 4 - barPadding)
                            .attr('x', x(i))
                            .attr('fill', 'red')
                            .attr('barplus', barPlus)
                            .attr('barminus', barMinus)
                            .on("mouseover", function() {
                                        return tooltip.style("visibility","visible").text($(this).attr('barplus') + "+ " + $(this).attr('barminus') + "-");
                                    })
                            .on("mousemove", function(){
                                    var yoffset = parseInt($(this).attr('barplus')) + parseInt($(this).attr('barminus')) > 40 ? $(this).offset().top - 60 : $(this).offset().top - 75;
                                    if(parseInt($(this).attr('barplus')) + parseInt($(this).attr('barminus')) > settings.maxCoverage*1.5) {
                                    var difference = parseInt($(this).attr('barplus')) + parseInt($(this).attr('barminus')) - settings.maxCoverage*1.5;
                                    yoffset = $(this).offset().top + difference/3;
                                    }
                                    var xoffset = $(this).offset().left - 280;
                                    return tooltip.style("top", yoffset + "px").style("left", xoffset +"px");})
                            .on("mouseout", function() {
                                        return tooltip.style("visibility","hidden");
                                        });
                    }
                    var labelsContainer = svg.append('g')
                    labelsContainer.append('text')
                        .attr("y", h)
                        .attr('x', x(i)+(w/4 - barPadding)/2)
                        .attr('stroke', 'none')
                        .attr('fill', 'black')
                        .attr('text-anchor', 'middle')
                        .text(barLabel);
                    if(h - barValue - bottomPadding < 0) {
                        labelsContainer.append('text')
                            .attr("y", valueLabelHeight)
                            .attr("x", x(i)+(w/4 - barPadding)/2)
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "11px")
                            .attr("text-anchor", "middle")
                            .attr("fill", "white")
                            .text(d["value"])
                    } else if(barValue > valueLabelHeight*1.25) {
                        labelsContainer.append('text')
                            .attr("y", h - barValue - bottomPadding + valueLabelHeight)
                            .attr("x", x(i)+(w/4 - barPadding)/2)
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "11px")
                            .attr("text-anchor", "middle")
                            .attr("fill", "white")
                            .text(d["value"]);
                    } else {
                        labelsContainer.append('text')
                            .attr("y", h - barValue - bottomPadding - valueLabelHeight/2)
                            .attr("x", x(i)+(w/4 - barPadding)/2)
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "11px")
                            .attr('text-anchor', "middle")
                            .attr("fill", "black")
                            .text(d["value"])
                        }
                    }
                }
            });
        }
} (jQuery));
