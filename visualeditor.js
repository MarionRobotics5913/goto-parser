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
var width = 5,
  height = 5;
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
  //the robot
  window.fill("#c9c9c9");
  window.rect(x, y, width, height);
  //motors
  window.fill("#696969");
  //front left
  window.rect(x + width / 16, y + height / 21, width / 3, height / 8);
  //front right
  window.rect(x + width / 1.4, y + height / 21, width / 3, height / 8);
  //back left
  window.rect(x + width / 16, y + height / 1.2, width / 3, height / 8);
  //back right
  window.rect(x + width / 1.4, y + height / 1.2, width / 3, height / 8);
  //the treads
  window.fill("#000000");
  window.rect(
    x - width / 10,
    y - height / 10,
    width / 5,
    height + height / 5
  );
  window.rect(x + width, y - width / 10, width / 5, height + height / 5);
  //the control bub and the expantion hub
  window.fill("#4a4a4a");
  window.rect(x + width / 5, y + height / 2, width / 3, height / 4);
  //battery holder
  window.fill("#7ce800");
  window.rect(x + width / 1.5, y + height / 2.25, width / 5, height / 2.6);
  //battery
  window.fill("#000000");
  window.rect(x + width / 1.43, y + height / 2.1, width / 8, height / 3.3);
}

