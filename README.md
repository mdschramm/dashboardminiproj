This plugin is incorporated into the main dashboard by:
1) Having d3.v3.js in dashboardngs/pbg/static/js
2) Having mutRefGraph.js and textToGraph.js in dashboardngs/pbg/apps/analysis/static
3) Linking the 3 files in base.html in the following order 1)d3.v3.js, 2) mutRefGraph.js 3)textToGraph.js
4) In templates/analysis/project_detail.html, under the candidate variant information table section, immediately after the opening <table> tag, have:
<div id=sliderValue></div>
<br>
<div id=mutSlider></div>
<br>
5) Finally, add the class variantTable to aforementioned <table> tag.
