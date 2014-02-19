This is a plugin written javascript, specifically to be incorporated into a datatable
containing gene information. The plugin parses textual data in the form of 
mut\.[(\d)*\+\|(\d)*-],ref\.[(\d)*\+\|(\d)*-] where mut and ref stand for mutant or
reference genes, and the numbers within the brackets indicate the quantity and type
of reads for each particular gene. The plugin displays this data in the form of an
interactive bar graph.

This plugin is incorporated into the main dashboard by:

1) Having d3.v3.js in dashboardngs/pbg/static/js
2) Having mutRefGraph.js and textToGraph.js in dashboardngs/pbg/apps/analysis/static
3) Sourcing the 3 files in base.html in the following order 1)d3.v3.js, 2) mutRefGraph.js 3)textToGraph.js
4) In templates/analysis/project_detail.html, under the candidate variant information table section, immediately after the opening [table] tag, have:
[div id=sliderValue][/div]
[br]
[div id=mutSlider][/div]
[br]
5) Finally, add the class variantTable to aforementioned [table] tag.
