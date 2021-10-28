var gridActivated = true;
var removeCanvas = true;
var visualeditor = document.getElementById("visualeditor");
var VEactivated = false;
var drawSquares = true;

var x = 23;
var y = 36;
var grid_squares = [];
var gridX = 1;
var gridY = 1;
var width = 37,
  height = 37;
var gridLineColor = "#4a4a4a";
var tan = "#f1ffb8";
var grey = "#4a4a4a";
function setup() {}
function draw() {
  window.stroke(gridLineColor);
  window.fill("#f1ffb8");
  window.resizeCanvas(300, 300);
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      window.rect(i * 50, j * 50, 50, 50);
    }
  }
}
