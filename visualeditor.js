var gridActivated = true;
var removeCanvas = true;
var visualeditor = document.getElementById("visualeditor");
var VEactivated = false;
var drawSquares = true;

var xpos = 5;
var ypos = 5;
var grid_squares = [];
var gridX = 1;
var gridY = 1;
var widthpos = 37,
  heightpos = 37;
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

  window.rotate();
  // the testing
  //the robot
  window.fill("#c9c9c9");
  window.rect(xpos, ypos, widthpos, heightpos);
  //motors
  window.fill("#696969");
  //front left
  window.rect(
    xpos + widthpos / 16,
    ypos + heightpos / 21,
    widthpos / 3,
    heightpos / 8
  );
  //front right
  window.rect(
    xpos + widthpos / 1.4,
    ypos + heightpos / 21,
    widthpos / 3,
    heightpos / 8
  );
  //back left
  window.rect(
    xpos + widthpos / 16,
    ypos + heightpos / 1.2,
    widthpos / 3,
    heightpos / 8
  );
  //back right
  window.rect(
    xpos + widthpos / 1.4,
    ypos + heightpos / 1.2,
    widthpos / 3,
    heightpos / 8
  );
  //the treads
  window.fill("#000000");
  window.rect(
    xpos - widthpos / 10,
    ypos - heightpos / 10,
    widthpos / 5,
    heightpos + heightpos / 5
  );
  window.rect(
    xpos + widthpos,
    ypos - widthpos / 10,
    widthpos / 5,
    heightpos + heightpos / 5
  );
  //the control bub and the expantion hub
  window.fill("#4a4a4a");
  window.rect(
    xpos + widthpos / 5,
    ypos + heightpos / 2,
    widthpos / 3,
    heightpos / 4
  );
  //battery holder
  window.fill("#7ce800");
  window.rect(
    xpos + widthpos / 1.5,
    ypos + heightpos / 2.25,
    widthpos / 5,
    heightpos / 2.6
  );
  //batterypos
  window.fill("#000000");
  window.rect(
    xpos + widthpos / 1.43,
    ypos + heightpos / 2.1,
    widthpos / 8,
    heightpos / 3.3
  );
  
}
document.onkeydown = function(event) {
  switch (event.keyCode) {
    case 37:
      xpos-=5;
      break;
    case 38:
      ypos+=5;
      break;
    case 39:
      xpos+=5;
      break;
    case 40:
      ypos-=5;
      break;
  }
};
