var randomScalingFactor = function() {
  return Math.round(Math.random() * 100);
};
// var csvdata = d3.csv("/housing_test.csv", d3.autoType);
// var keys = d3.csvdata.key();
// console.log(keys);

var jsonfile = {
  "ALarray": [{
    "name": "less then 50,000",
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
    "name": "200,000 to ",
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
      label: 'Paid Percentage' // for legend
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
      text: 'Housing Mortgage Polar Area Chart'
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

document.getElementById('randomizeData').addEventListener('click', function() {
  config.data.datasets.forEach(function(piece, i) {
    piece.data.forEach(function(value, j) {
      config.data.datasets[i].data[j] = randomScalingFactor();
    });
  });
  window.myPolarArea.update();
});

var colorNames = Object.keys(window.chartColors);
document.getElementById('addData').addEventListener('click', function() {
  if (config.data.datasets.length > 0) {
    config.data.labels.push('data #' + config.data.labels.length);
    config.data.datasets.forEach(function(dataset) {
      var colorName = colorNames[config.data.labels.length % colorNames.length];
      dataset.backgroundColor.push(window.chartColors[colorName]);
      dataset.data.push(randomScalingFactor());
    });
    window.myPolarArea.update();
  }
});