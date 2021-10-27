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

window.visualEditor = function() {
  var veElement = document.getElementById("visualeditor");
  var editor = document.getElementById("editor");
  var highlighter = document.getElementById("highlighter");

  if (visualeditor.style.display === "auto" || VEactivated === true) {
    //deactivate
    // veElement.classList.remove("editorin");
    // veElement.classList.add("editorout");
    // editor.classList.remove("editorout");
    // editor.classList.add("editorin");
    // highlighter.classList.remove("editorout");
    // highlighter.classList.add("editorin");

    VEactivated = false;
    document.getElementById("editor").style.visibility = "visible";
    document.getElementById("editor").style.display = "initial";
    document.getElementById("highlighter").style.visibility = "visible";
    document.getElementById("highlighter").style.display = "initial";
    veElement.style.display = "none";
    veElement.style.visibility = "hidden";
    window.resizeCanvas(1, 1);
    grid_squares.length = 0;
    removeCanvas = false;
  } else if (visualeditor.style.display === false || VEactivated === false) {
    //activate
    // veElement.classList.remove("editorout");
    // veElement.classList.add("editorin");
    // editor.classList.remove("editorin");
    // editor.classList.add("editorout");
    // highlighter.classList.remove("editorin");
    // highlighter.classList.add("editorout");

    VEactivated = true;
    document.getElementById("editor").style.visibility = "hidden";
    document.getElementById("editor").style.display = "none";
    document.getElementById("highlighter").style.visibility = "hidden";
    document.getElementById("highlighter").style.display = "none";
    veElement.style.display = "initial";
    veElement.style.visibility = "visible";
    window.resizeCanvas(200, 200);
    grid_squares.length = 36;
    //credit to google's color picker for the hex versions of the colors
    //the feild
    //ctx.fillStyle = "#f1ffb8";
    //ctx.strokeStyle = "#4a4a4a";
    //ctx.strokeWeight = "6";
    //the feild
    // ctx.translate(x + width / 2, y + height / 2);
    // ctx.rotate((90 * Math.PI) / 180);
    // ctx.translate(-x, -y);
    //the robot
    // ctx.fillStyle = "#c9c9c9";
    // ctx.fillRect(x, y, width, height);
    // //motors
    // ctx.fillStyle = "#696969";
    // //front left
    // ctx.fillRect(x + width / 16, y + height / 21, width / 3, height / 8);
    // //front right
    // ctx.fillRect(x + width / 1.4, y + height / 21, width / 3, height / 8);
    // //back left
    // ctx.fillRect(x + width / 16, y + height / 1.2, width / 3, height / 8);
    // //back right
    // ctx.fillRect(x + width / 1.4, y + height / 1.2, width / 3, height / 8);
    // //the treads
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(x - width / 10, y - height / 10, width / 5, height + height / 5);
    // ctx.fillRect(x + width, y - width / 10, width / 5, height + height / 5);
    // //the control bub and the expantion hub
    // ctx.fillStyle = "#4a4a4a";
    // ctx.fillRect(x + width / 5, y + height / 2, width / 3, height / 4);
    // //battery holder
    // ctx.fillStyle = "#7ce800";
    // ctx.fillRect(x + width / 1.5, y + height / 2.25, width / 5, height / 2.6);
    // //battery
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(x + width / 1.43, y + height / 2.1, width / 8, height / 3.3);
    removeCanvas = false;
  }
};
window.setup = function setup() {
  var cvs = window.createCanvas(200, 200);
  cvs.position(20, 67);
};
window.draw = function draw() {
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
