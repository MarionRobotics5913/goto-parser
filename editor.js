import GotoParser from "./modules/parser.js";

// Credit to StackOverflow: https://stackoverflow.com/questions/4282151/is-it-possible-to-ping-a-server-from-javascript
document.getElementById("visualeditor").style.display = "none";
document.getElementById("visualeditor").style.visibility = "hidden";
//document.getElementById("robot").style.visibility = "hidden";
//document.getElementById("robot").style.display = "none";

// document.getElementById("visualeditor").style.opacity = "0";
var visualeditor = document.getElementById("visualeditor");
//var robot = document.getElementById("robot");
var VEactivated = false;
var drawSquares = true;

function ping(host, port, pong) {
  var started = new Date().getTime();

  var http = new XMLHttpRequest(); // Fetch API?

  http.open("GET", "http://" + host + ":" + port, /*async*/ true);
  http.onreadystatechange = function() {
    if (http.readyState == 4 && http.status == 200) {
      var ended = new Date().getTime();
      var milliseconds = ended - started;
      if (pong != null) {
        pong(milliseconds);
      }
    }
  };
  try {
    http.send(null);
  } catch (exception) {
    // this is expected
  }
}

// Credit to StackOverflow: https://stackoverflow.com/questions/4313841/insert-a-string-at-a-specific-index
if (!String.prototype.splice) {
  /**
   * {JSDoc}
   *
   * The splice() method changes the content of a string by removing a range of
   * characters and/or adding new characters.
   *
   * @this {String}
   * @param {number} start Index at which to start changing the string.
   * @param {number} delCount An integer indicating the number of old chars to remove.
   * @param {string} newSubStr The String that is spliced in.
   * @return {string} A new string with the spliced substring.
   */
  String.prototype.splice = function(start, delCount, newSubStr) {
    return (
      this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount))
    );
  };
}

if (window.process && process.versions.hasOwnProperty("electron")) {
} else {
  function upload() {
    var name = "Meepably";
    if (!name) return;
    // Robot is at either http://192.168.43.1:8080 or http://192.168.49.1:8080
    // Process:
    // 1. Build Java file
    // 2. Send POST request to <server>/java/file/upload
    //   a. Send file as "file" in a multipart form
    var responseRecieved = false;
    function part2(url, millis) {
      if (responseRecieved) return;
      responseRecieved = true;

      var xhr = new XMLHttpRequest(); // Fetch API?
      var file =
        "package org.firstinsprites.ftc.teamcode;\n" +
        '@GotoProgram(name="' +
        name +
        '", code=' +
        JSON.stringify(document.getElementById("editor").value) +
        ")\npublic class Goto" +
        name +
        " {}";
      var data = new FormData();
      data.append(
        "file",
        new Blob([file], { type: "text/x-java" }),
        "goto." + name + ".java"
      );
      xhr.open("POST", url + "/java/file/upload");
      xhr.send(data);
    }
    ping("192.168.43.1", "8080", part2);
    ping("192.168.49.1", "8080", part2);
  }

  var parseButton = document.getElementById("parseButton");
  var uploadButton = document.createElement("button");
  uploadButton.innerHTML = "Upload";
  uploadButton.onclick = upload;
  parseButton?.parentNode?.insertBefore(uploadButton, parseButton.nextSibling);
}

var data;

// This is just for handling stuff on this page and testing
function runGotoActions(actionObject, callback) {
  // for (var x in actionObject) {
  //   switch (actionObject[x].command) {
  //     case "error":
  //       callback(`Error: ${actionObject[x].message}`);
  //       return actionObject[x].message;
  //       break;
  //     case "goto":
  //       callback(`goto: ${JSON.stringify(actionObject[x].args)}`);
  //       break;
  //     default:
  //       callback(`Unrecognized command ${actionObject[x].command} run`);
  //   }
  // }
  function toBlock(action) {
    if (action.type === "error") {
      return `<div class='error command-block'>
            <strong>Error</strong>:
            ${action.name} (at&nbsp${action.args.line}:${action.args.column})
          </div>`;
    } else if (action.name === "block") {
      return `<div class='command-block'>
            <strong>${action.name}</strong>
            <br>
            ${action.args.map(toBlock).join("")}
          </div>`;      
    } else {
      return `<div class='command-block'>
            <strong>${action.name}</strong> -
            ${Object.entries(action.args)
              .map(([x, v]) => `${x}: ${v}`)
              .join(", ")}
          </div>`;
    }
  }
/*  var res = `<br />
    ${actionObject.issues
      ?.map(
        issue => `<div class='warn command-block'>
    ${issue.message}</div>`
      )
      .join("")}
    ${actionObject.actions
      ?.map(action => {
        if (action.type === "error") {
          return `<div class='error command-block'>
            <strong>Error</strong>:
            ${action.name} (at&nbsp${action.args.line}:${action.args.column})
          </div>`;
        } else {
          return `<div class='command-block'>
            <strong>${action.name}</strong> -
            ${Object.entries(action.args)
              .map(([x, v]) => `${x}: ${v}`)
              .join(", ")}
          </div>`;
        }
      })
      ?.join("")}`;*/
  var res = `
    ${actionObject.issues
      ?.map(
        issue => `<div class='warn command-block'>
    ${issue.message}</div>`
      )
      .join("")}
    ${actionObject.actions.map(toBlock)?.join("")}`;
  callback(res);
}

window.highlightBlocks = function() {
  var codeBlocks = [
    ...document.getElementsByTagName("code")
    // ...document.getElementsByClassName("code-block")
  ];
  for (var x of codeBlocks) {
    x.innerHTML = new GotoParser().highlight(x.innerText);
  }
};

window.parseProgram = function(programString) {
  document.getElementById("output").innerHTML = document.getElementById(
    "output"
  ).innerHTML = "Running...<br /><br />";
  runGotoActions(new GotoParser().parseProgram(programString), output => {
    document.getElementById("output").innerHTML = output;
  });
  highlightBlocks();
};

window.codeUpdate = function(parse) {
  // Run every time the textarea updates
  var textarea = document.getElementById("editor");
  var highlighter = document.getElementById("highlighter");
  if (!textarea || !highlighter) return;

  var text = document.getElementById("toggleHighlight")?.checked
    ? new GotoParser().highlight(textarea?.value)
    : textarea?.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/\ /g, "&nbsp;")
        .replace(/\n/g, "<br />");
  if (text.endsWith("<br />")) text += " ";
  highlighter.height = textarea.clientHeight;
  highlighter.innerHTML = text;

  // alert(text);
  if (parse && document.getElementById("autoparse").checked) {
    parseProgram(textarea.value);
  }
};

window.sync_scroll = function(element) {
  /* Scroll result to scroll coords of event - sync with textarea */
  // let result_element = document.querySelector("#highlighting");
  let result_element = document.getElementById("highlighter");
  // Get and set x and y
  result_element.scrollTop = element.scrollTop;
  result_element.scrollLeft = element.scrollLeft;
};

codeUpdate(true);

function addToUndoStack() {
  undoStack[stackPos++] = editor.value;
  if (stackPos > document.getElementById("undoStackSize")?.value) {
    undoStack.shift();
    stackPos--;
  }
}

// Actual page functions

var editor = document.getElementById("editor");
var undoStack = [editor?.value];
var stackPos = 0;
if (editor) {
  editor.value = editor.value.trim();
  editor.addEventListener("keydown", event => {
    // Function here :)
    var startSelectPos = editor.selectionStart;
    if (
      event.keyCode === 90 &&
      event.ctrlKey &&
      document.getElementById("ctrlZ")?.checked
    ) {
      //ctrl + z
      if (stackPos > 0) {
        if (stackPos === undoStack.length) {
          addToUndoStack();
          stackPos--;
        }
        stackPos--;
        editor.value = undoStack[stackPos];
      }
      editor.setSelectionRange(startSelectPos, startSelectPos);
      event.preventDefault();
      event.stopPropagation();
    }

    if (
      event.keyCode === 89 &&
      event.ctrlKey &&
      document.getElementById("ctrlZ")?.checked
    ) {
      //crtl + y
      if (stackPos < undoStack.length - 1) {
        stackPos++;
        editor.value = undoStack[stackPos];
      }
      editor.setSelectionRange(startSelectPos, startSelectPos);
      event.preventDefault();
      event.stopPropagation();
    }

    if (
      event.key === "l" &&
      event.ctrlKey &&
      document.getElementById("ctrlL")?.checked
    ) {
      var position = editor.selectionStart;
      var first = editor.value.slice(0, position).split("\n");
      var second = editor.value.slice(position).split("\n");
      editor.setSelectionRange(
        position - first[first.length - 1].length,
        position + second[0].length
      );
      event.preventDefault();
      event.stopPropagation();
    }

    if (
      event.key === "/" &&
      event.ctrlKey &&
      document.getElementById("ctrl/")?.checked
    ) {
      // alert(editor.type);
      addToUndoStack();
      var position = editor.selectionStart;

      var newLinePos = 0;
      for (var i = position - 1; i > 0; i--) {
        if (editor.value[i] === "\n") {
          newLinePos = i + 1;
          break;
        }
      }
      if (
        editor.value[newLinePos] === "/" &&
        editor.value[newLinePos + 1] === "/"
      ) {
        editor.value = editor.value.splice(newLinePos, 2, "");
        editor.setSelectionRange(position - 2, position - 2);
      } else {
        editor.value = editor.value.splice(newLinePos, 0, "//");
        editor.setSelectionRange(position + 2, position + 2);
      }

      event.preventDefault();
      event.stopPropagation();
    }

    if (
      event.keyCode === 40 &&
      event.ctrlKey &&
      document.getElementById("ctrlDown")?.checked
    ) {
      //janky autofill WIP
      //ctrl + down
      addToUndoStack();
      let actions = new GotoParser().reservedWords;

      let line = [];
      var position = editor.selectionStart;
      let newLinePos = 0;
      for (var i = position - 1; i >= 0; i--) {
        if (editor.value[i] !== "\n") {
          line.push(editor.value[i]);
        } else {
          newLinePos = i;
          break;
        }
      }
      line = line.reverse();
      for (var i = position; i < editor.value.length; i++) {
        if (editor.value[i] !== "\n") {
          line.push(editor.value[i]);
        } else {
          break;
        }
      }
      line = line.join("");

      let action = "";
      for (let i = 0; i < line.length - 1; i++) {
        if (line[i] === " ") {
          action = line.substr(0, i);
          break;
        }
      }

      if (action === "") {
        for (let i = 0; i < actions.length; i++) {
          if (actions[i].substr(0, line.length) === line) {
            action = actions[i];
            break;
          }
        }
      }

      let lineEnd = 0;
      let lineFill = "";
      switch (action) {
        case "goto":
          lineFill = "\ngoto x: # y: # stop";
          editor.value = editor.value.splice(
            newLinePos,
            line.length + 1,
            lineFill
          );
          editor.setSelectionRange(newLinePos + 9, newLinePos + 10);
          lineEnd = lineFill.length;
          break;
        case "set":
          lineFill = "\nset periph: # stop";
          editor.value = editor.value.splice(
            newLinePos,
            line.length + 1,
            lineFill
          );
          editor.setSelectionRange(newLinePos + 5, newLinePos + 11);
          lineEnd = lineFill.length;
          break;
        case "start":
          lineFill = "\nstart x: # y: #";
          editor.value = editor.value.splice(
            newLinePos,
            line.length + 1,
            lineFill
          );
          editor.setSelectionRange(newLinePos + 10, newLinePos + 11);
          lineEnd = lineFill.length;
          break;
        case "radius":
          lineFill = "\nradius x: # y: #";
          editor.value = editor.value.splice(
            newLinePos,
            line.length + 1,
            lineFill
          );
          editor.setSelectionRange(newLinePos + 11, newLinePos + 12);
          lineEnd = lineFill.length;
          break;
      }
      if (newLinePos === 0 && lineFill !== "") {
        editor.value = editor.value.splice(0, 1, "");
        editor.value = editor.value.splice(lineEnd - 1, 0, "\n");
        editor.setSelectionRange(0, lineEnd - 1); //because chances are the action will be start
      }
      event.preventDefault();
      event.stopPropagation();
    }

    if (
      event.keyCode === 9 &&
      !event.shiftKey &&
      document.getElementById("tab")?.checked
    ) {
      //tab
      addToUndoStack();
      var position = editor.selectionStart;

      var newLinePos = 0;
      for (var i = position - 1; i > 0; i--) {
        if (editor.value[i] === "\n") {
          newLinePos = i + 1;
          break;
        }
      }

      editor.value = editor.value.splice(newLinePos, 0, "  ");
      editor.setSelectionRange(position + 2, position + 2);
      event.preventDefault();
      event.stopPropagation();
    }
    if (
      event.keyCode === 9 &&
      event.shiftKey &&
      document.getElementById("tab")?.checked
    ) {
      //tab + shift
      addToUndoStack();
      var position = editor.selectionStart;

      var newLinePos = 0;
      for (var i = position - 1; i > 0; i--) {
        if (editor.value[i] === "\n") {
          newLinePos = i + 1;
          break;
        }
      }
      if (
        editor.value[newLinePos] === " " &&
        editor.value[newLinePos + 1] === " "
      ) {
        editor.value = editor.value.splice(newLinePos, 2, "");
        editor.setSelectionRange(position - 2, position - 2);
      }

      event.preventDefault();
      event.stopPropagation();
    }

    if (event.keyCode === 32 && document.getElementById("ctrlZ")?.checked) {
      //space
      addToUndoStack();
    }

    if (event.keyCode === 13 && document.getElementById("ctrlZ")?.checked) {
      //enter
      addToUndoStack();
    }

    if (event.keyCode === 8 && document.getElementById("ctrlZ")?.checked) {
      //backspace
      addToUndoStack();
    }

    if (event.keyCode === 37) {
      //left arrow key
      console.log("left");
    }
    if (event.keyCode === 38) {
      //up arrow key
      console.log("up");
      y++;
    }
    if (event.keyCode === 39) {
      //right arrow key
      console.log("right");
    }
    if (event.keyCode === 40) {
      //down arrow key
      console.log("down");
      y--;
    }

    // console.log(undoStack);
    codeUpdate(true); //calls hightlighter and parser (if enabled)
  });
}

window.toggleCollapse = function(name) {
  var settingsPanel = document.getElementById(name);
  if (!settingsPanel) return "The thing"; // lol

  settingsPanel.style.animationDuration = "0.8s";
  if (
    settingsPanel.classList.contains("collapsed") ^
    settingsPanel.classList.contains("expanded")
  ) {
    settingsPanel.classList.toggle("expanded");
  }
  settingsPanel.classList.toggle("collapsed");
};

var ctx = visualeditor.getContext("2d");
var robotCtx = visualeditor.getContext("2d");

window.draw = function() {};

var gridActivated = true;

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
for (var i = 0; i < 6; ) {
  for (var j = 0; j < 6; ) {
    ctx.fillStyle = "#f1ffb8";
    ctx.fillRect(i * 50, j * 50, 50, 50);
    grid_squares.push("" + i + "," + j);
    j++;
  }
  i++;
}

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
    visualeditor.style.display = "none";
    visualeditor.style.visibility = "hidden";
    grid_squares.length = 0;
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
    visualeditor.style.display = "block";
    visualeditor.style.visibility = "visible";
    grid_squares.length = 36;
    //credit to google's color picker for the hex versions of the colors
    //the feild
    ctx.fillStyle = "#f1ffb8";
    ctx.strokeStyle = "#4a4a4a";
    ctx.strokeWeight = "6";
    //the feild
    // ctx.translate(x + width / 2, y + height / 2);
    // ctx.rotate((90 * Math.PI) / 180);
    // ctx.translate(-x, -y);
    for (var i = 0; i < 6; ) {
      for (var j = 0; j < 6; ) {
        ctx.strokeStyle = gridLineColor;
        ctx.strokeRect(i * 50, j * 50, 50, 50);
        grid_squares.push("" + i + "," + j);
        j++;
      }
      i++;
    }
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.translate(-x, -y);
    //the robot
    robotCtx.fillStyle = "#c9c9c9";
    robotCtx.fillRect(x, y, width, height);
    //motors
    robotCtx.fillStyle = "#696969";
    //front left
    robotCtx.fillRect(x + width / 16, y + height / 21, width / 3, height / 8);
    //front right
    robotCtx.fillRect(x + width / 1.4, y + height / 21, width / 3, height / 8);
    //back left
    robotCtx.fillRect(x + width / 16, y + height / 1.2, width / 3, height / 8);
    //back right
    robotCtx.fillRect(x + width / 1.4, y + height / 1.2, width / 3, height / 8);
    //the treads
    robotCtx.fillStyle = "#000000";
    robotCtx.fillRect(
      x - width / 10,
      y - height / 10,
      width / 5,
      height + height / 5
    );
    robotCtx.fillRect(
      x + width,
      y - width / 10,
      width / 5,
      height + height / 5
    );
    //the control bub and the expantion hub
    robotCtx.fillStyle = "#4a4a4a";
    robotCtx.fillRect(x + width / 5, y + height / 2, width / 3, height / 4);
    //battery holder
    robotCtx.fillStyle = "#7ce800";
    robotCtx.fillRect(
      x + width / 1.5,
      y + height / 2.25,
      width / 5,
      height / 2.6
    );
    //battery
    robotCtx.fillStyle = "#000000";
    robotCtx.fillRect(
      x + width / 1.43,
      y + height / 2.1,
      width / 8,
      height / 3.3
    );
  }
};
function update() {}

if (localStorage.ok) {
  //   var inputs = document.getElementsByTagName("input");
  //   for(var i in inputs){
  //   }
} else {
  if (
    confirm(
      "This page would like to use localStorage to save settings and programs. Is that okay?"
    )
  )
    localStorage.ok = true;
}
