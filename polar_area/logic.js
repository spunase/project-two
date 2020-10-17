var randomScalingFactor = function() {
  return Math.round(Math.random() * 100);
};
var csvdata = d3.csv("final_dataset_101520.csv")
    .then(data => {
        data.forEach(d => {
            d.total = +d.year;
            d.value_50k_less	= +d.value_50k_less
            d.value_50000to99999	= +d.value_50000to99999
            d.value_100000to149999	= +d.value_100000to149999
            d.value_150000to199999 = +d.value_150000to199999	
            d.value_200000to299999	= +d.value_200000to299999
            d.value_300000to499999	= +d.value_300000to499999
            d.value_500000to999999 = +d.value_500000to999999	
            d.value_1M_more = +d.value_1M_more
        });   

        var allYears = new Set(data.map(d => +d.year));
        // add the options to the year drop-down button
        d3.select("#yearDropdown")
            .selectAll('myOptions')
                .data(allYears)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d) { return d; }); // corresponding value returned by the button

        var allStates = new Set(data.map(d => d.state));
        // add the options to the year drop-down button
        d3.select("#stateDropdown")
            .selectAll('myOptions')
                .data(allStates)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d) { return d; }); // corresponding value returned by the button

        var year = 2019;                 // Initialize with year 2019 so this is the chart default
        var yearData = getFilteredData(data, year);
        console.log("Default year 2019", yearData);
});

var jsonfile = {
  "ALarray": [{
    "name": "less than 50,000",
    "value": 390929
  }, 
  {
    "name": "50,000 to 99,999",
    "value": 98865
  },
  {
    "name": "100,000 to 149,000",
    "value": 64209
  },
  {
    "name": "150,000 to 199,999",
    "value": 38151
  },
  {
    "name": "200,000 to 249,999",
    "value": 12900
  },
  {
    "name": "not_computed",
    "value": 4942
  }]
};

var labels = jsonfile.ALarray.map(function(e) {
  return e.name;
});
var data = jsonfile.ALarray.map(function(e) {
  return e.value;
});;

window.chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

var chartColors = window.chartColors;
var color = Chart.helpers.color;
var config = {
  type: 'polarArea',
  data: {
    datasets: [{
      data: data,
      backgroundColor: [
        color(chartColors.red).alpha(0.5).rgbString(),
        color(chartColors.orange).alpha(0.5).rgbString(),
        color(chartColors.blue).alpha(0.5).rgbString(),
        color(chartColors.green).alpha(0.5).rgbString(),
        color(chartColors.purple).alpha(0.5).rgbString(),
        color(chartColors.grey).alpha(0.5).rgbString(),
        color(chartColors.yellow).alpha(0.5).rgbString()
      ],
      label: 'Value' // for legend
    }],
    labels: labels
  },
  options: {
    responsive: true,
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Housing Value Polar Area Chart'
    },
    scale: {
      ticks: {
        beginAtZero: true
      },
      reverse: false
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  }
};

window.onload = function() {
  var ctx = document.getElementById('chart-area');
  window.myPolarArea = new Chart(ctx, config);
};

document.getElementById('yearDropdown').addEventListener('click', function() {
  config.data.datasets.forEach(function(piece, i) {
    piece.data.forEach(function(value, j) {
      config.data.datasets[i].data[j] = randomScalingFactor();
    });
  });
  window.myPolarArea.update();
});

// When the button is changed, run the updateChart function
document.getElementById('yearDropdown').addEventListener('change', function() {
  // recover the option that has been chosen
  var selectedYear = d3.select(this).property("value");
  console.log(selectedYear);
  console.log(data);
  var yearData = getFilteredData(data, selectedYear);
  console.log("selected year",yearData);
  // run the updateChart function with this selected option
  // extract the data for the year selected by user  
  window.myPolarArea.update();
});

// var colorNames = Object.keys(window.chartColors);
// document.getElementById('addData').addEventListener('click', function() {
//   if (config.data.datasets.length > 0) {
//     config.data.labels.push('data #' + config.data.labels.length);
//     config.data.datasets.forEach(function(dataset) {
//       var colorName = colorNames[config.data.labels.length % colorNames.length];
//       dataset.backgroundColor.push(window.chartColors[colorName]);
//       dataset.data.push(randomScalingFactor());
//     });
//     window.myPolarArea.update();
//   }
// });

 // Get a subset of the data based on the group
function getFilteredData(data, year) {
  return data.filter(function(d){return d.year == year;})
};