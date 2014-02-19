//Uses the mutRefGraph plugin and dataTable plugin to draw the graphs, only on the table cells that are displayed.
var oTable = $(".variantTable").dataTable({
    "aaSorting": [[0, "desc"]],
    "sPaginationType": "bootstrap",
    "oLanguage": {
        "sLengthMenu": "_MENU_ records per page",
        "sSearch": "Filter all columns"
    },    
    "fnDrawCallback": function(oSettings) {
        var filteredRows = $(".variantTable tbody tr");
        for(var i = 0; i < filteredRows.length; i++) {
            var row = filteredRows[i];
            if(row.className != "mutRefGraph" && row.firstChild.className != "dataTables_empty") {
                row.className = "mutRefGraph";
                $.each(row.cells, function() {
                    if((validInnerText(this.innerHTML)) && this.className != "alreadyGraphed") {
                        var toParse = this.innerHTML;
                        this.innerHTML = "";//"<div style=\"opacity: 0; height:0px; width: 0px\">" + this.innerHTML + "</div>";
                        $(this).mutRefGraph ({
                            data: toParse,
                            graphWidth: 150,
                            graphHeight: 70,
                        });               
                        this.className = "alreadyGraphed";
                    }
                });
            }
        }
    },
});
var filterRatio = 0;

//Stylings
$("#sliderValue").html("Minimum percentage of mut reads: 0.0%");
$("#sliderValue").css({"margin-left":"40%"});
$("#mutSlider").css({"width":"500px", "margin":"0 auto"});
$("<style>.x.axis {fill:none; stroke: black; shape-rendering: crispEdges;} .x.axis text {display:none;}</style>").appendTo("head");
//Slider changes filter ratio and updates html label when slider is moved.
$("#mutSlider").slider({ min : 0,
                         max : 1,
                         step : .001,
                         change: function(event, ui) {
                                    filterRatio = $("#mutSlider").slider("option", "value");
                                    $("#sliderValue").html("Minimum percentage of mut reads: " + ($("#mutSlider").slider("option", "value")*100).toFixed(1) + "%");
                                    oTable.fnDraw();
                                    } 
});
$("#mutSlider").addClass("slider").addClass("sliderRed");
//$("<table id=all_filters><thead><th style=width:33%><div id=DataTables_Table_0_length>" + $("#DataTables_Table_0_length")[0].innerHTML + "</div></th><th style=width:33%><div id=mutSlider class=\"ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all\" aria-disables=false style=\"width: 500px; margin: 0px auto;\">" + $("#mutSlider")[0].innerHTML + "</div></th><th style=width:33%><div class=dataTables_filter id=DataTables_Table_0_filter>" + $("#DataTables_Table_0_filter")[0].innerHTML + "</div></th></thead></table>").appendTo($("#sliderValue"));

//$("#all_filters").css({"margin-left":"0%"});
//Not an ideal way to check, but the full regex would be quite long.
function validInnerText(str) {
    return (str.indexOf('mut.') > -1 || str.indexOf('ref.') > -1);
}

// Slider filter logic
$.fn.dataTableExt.afnFiltering.push(
    function (oSettings, aData, iDataIndex) {
        //Loops starting at the end of the row where all of the desired cells are assumed to be,
        //and breaks when the first non-desirable row is reached for efficiency.
            for(var i=aData.length - 1; i > -1; i--) {
                if(validInnerText(aData[i])) {
                    var testr = aData[i];
                    var arr = [];
                    if(testr.indexOf('mut') > -1) {
                        separateByCommas(testr, arr);
                        var sum = 0;
                        var mutSum = 0;
                        for(var j=0; j<arr.length; j++) {
                            var str = arr[j];
                            if(str.indexOf('mut') > -1) {
                                if(str.indexOf('|') > -1) {
                                    sum += parseInt(str.substring(str.indexOf('[') + 1, str.indexOf('|') - 1));
                                    sum += parseInt(str.substring(str.indexOf('|') + 1, str.indexOf(']') - 1));
                                    mutSum += parseInt(str.substring(str.indexOf('[') + 1, str.indexOf('|') - 1));
                                    mutSum += parseInt(str.substring(str.indexOf('|') + 1, str.indexOf(']' - 1)));
                                } else {
                                    sum += parseInt(str.substring(str.indexOf('[') + 1, str.indexOf(']') - 1));
                                    mutSum += parseInt(str.substring(str.indexOf('[') + 1, str.indexOf(']') - 1));
                                }
                            } else {
                                if(str.indexOf('|') > -1) {
                                    sum += parseInt(str.substring(str.indexOf('[') + 1, str.indexOf('|') - 1));
                                    sum += parseInt(str.substring(str.indexOf('|') + 1, str.indexOf(']') - 1));
                                } else {
                                    sum += parseInt(str.substring(str.indexOf('[') + 1, str.indexOf(']') - 1));
                                } 
                            }
                        }
                        if(mutSum/sum >= filterRatio) return true;
                    }
                } else break;
            }
            return filterRatio == 0;
    }
);
//The same function in mutRefGraph, separates a string by commas.
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
