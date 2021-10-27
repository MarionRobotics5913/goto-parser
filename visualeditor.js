var gridActivated = true;
var removeCanvas = true;
var visualeditor = document.getElementById("visualeditor");
//var robot = document.getElementById("robot");
var VEactivated = false;
var drawSquares = true;

window.toggleGrid = function() {
  if (gridActivated === false) {
    gridLineColor = "#4a4a4a";
  } else if (gridActivated === true) {
    gridLineColor = "#f1ffb8";
  }
};

var x = 23;
var y = 36;
var grid_squares = [];
var gridX = 1;
var gridY = 1;
var width = 37,
  height = 37;
var gridLineColor = "#4a4a4a";
function setup() {
  var cvs = window.createCanvas(200, 200);
  cvs.position(20, 67);
};
function draw() {
  window.fill("#f1ffb8");
  for (var i = 0; i < 36; i++) {
    for (var j = 0; j < 36; j++) {
      window.rect(i * 50, j * 50, 50, 50);
    }
  }
  if (removeCanvas) {
    window.resizeCanvas(200, 200);
  } else if (!removeCanvas) {
    window.resizeCanvas(200, 200);
  }
};
