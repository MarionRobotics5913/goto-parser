var gridActivated = true;
var removeCanvas = true;
var visualeditor = document.getElementById("visualeditor");
var VEactivated = false;
var drawSquares = true;

var xpos = 20;
var ypos = 20;
var grid_squares = [];
var gridX = 1;
var gridY = 1;
var widthpos = 50,
  heightpos = 50;
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
  //the motors
  window.fill("#000000");
    window.rect(
      xpos - widthpos / 10,
      ypos - heightpos / 10,
      widthpos / 5,
      heightpos + heightpos / 5
    );
  window.rect(xpos + widthpos, ypos - widthpos / 10, widthpos / 5, heightpos + heightpos / 5);
  fillStyle = "#c9c9c9";
    fillRect(x, y, width, height);
    //motors
    fillStyle = "#696969";
    //front left
    fillRect(x + width / 16, y + height / 21, width / 3, height / 8);
    //front right
    fillRect(x + width / 1.4, y + height / 21, width / 3, height / 8);
    //back left
    fillRect(x + width / 16, y + height / 1.2, width / 3, height / 8);
    //back right
    fillRect(x + width / 1.4, y + height / 1.2, width / 3, height / 8);
  //body
  
  
  // the testing
  //the robot
    fillStyle = "#c9c9c9";
    fillRect(x, y, width, height);
    //motors
    fillStyle = "#696969";
    //front left
    fillRect(x + width / 16, y + height / 21, width / 3, height / 8);
    //front right
    fillRect(x + width / 1.4, y + height / 21, width / 3, height / 8);
    //back left
    fillRect(x + width / 16, y + height / 1.2, width / 3, height / 8);
    //back right
    fillRect(x + width / 1.4, y + height / 1.2, width / 3, height / 8);
    //the treads
    fillStyle = "#000000";
    fillRect(
      x - width / 10,
      y - height / 10,
      width / 5,
      height + height / 5
    );
    fillRect(x + width, y - width / 10, width / 5, height + height / 5);
    //the control bub and the expantion hub
    fillStyle = "#4a4a4a";
    fillRect(x + width / 5, y + height / 2, width / 3, height / 4);
    //battery holder
    fillStyle = "#7ce800";
    fillRect(x + width / 1.5, y + height / 2.25, width / 5, height / 2.6);
    //battery
    fillStyle = "#000000";
    fillRect(x + width / 1.43, y + height / 2.1, width / 8, height / 3.3);
  
}

