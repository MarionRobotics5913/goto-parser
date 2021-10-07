// Credit to StackOverflow: https://stackoverflow.com/questions/4282151/is-it-possible-to-ping-a-server-from-javascript
document.getElementById('visualeditor').style.display = 'none';
document.getElementById('visualeditor').style.visibility = 'hidden';
var VEactivated = false;

function ping(host, port, pong) {
  var started = new Date().getTime();

  var http = new XMLHttpRequest();

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

      var xhr = new XMLHttpRequest();
      var file = "package org.firstinsprites.ftc.teamcode;\n" +
        "@GotoProgram(name=\"" + name + "\", code=" + JSON.stringify(
          document.getElementById("editor").value
        ) +
        ")\npublic class Goto" + name + " {}";
      var data = new FormData();
      data.append("file", new Blob([file], {type: "text/x-java"}), "goto."+name+".java");
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

function GotoParser() {
  // this.lex; // Lexer
  // this.parse; // Parser
  // this.analyze; // Semantic analyzer
  // this.highlight; // Syntax highlighter that returns HTML content
  this.reservedWords = [
    "goto",
    "set",
    "start",
    "radius",
    "cont",
    "stop",
    "iltg"
  ];

  this.lex = function(programString) {
    var x = -1; // Gets incremented to 0 immediately and updates the character
    var column = 1;
    var line = 1;
    var tokens = [];
    var currToken = {
      line,
      column,
      type: undefined, // Not necessary but I like being able to see it if I look
      value: ""
    }; // Line, column, type, token
    function newToken() {
      tokens.push(currToken);
      currToken = {
        line,
        column,
        type: undefined,
        value: ""
      };
    } // Handling for unexpected weird tokens will be here, like "" or " " if they somehow end up being produced
    var char;
    var nextChar;
    var infiniteLoopStopper = 0;
    function increment() {
      infiniteLoopStopper++;
      if (infiniteLoopStopper > 100000) {
        throw "Lexer has incremented over 100000 times";
      }
      x++;
      char = programString[x];
      nextChar = programString[x + 1];
      if (char === "\n") {
        line++;
        column = 1;
      } else {
        column++;
      }
    }

    var infiniteLoopStopper = 0;
    while (x < programString.length) {
      increment();
      if (char === undefined) {
        //End of file
        currToken.type = "terminator";
        currToken.value = "eof";
        newToken();
      } else if (/[a-zA-Z]/.test(char)) {
        // Identifier
        currToken.type = "identifier";
        currToken.value += char;
        while (nextChar !== undefined && /[a-zA-Z0-9]/.test(nextChar)) {
          // While the next character is also an identifier character
          increment(); // Actually increment the counter
          currToken.value += char;
        }
        newToken();
      } else if (/[0-9\.]/.test(char)) {
        // Number
        currToken.type = "number";
        currToken.value += char;
        while (nextChar !== undefined && /[0-9\.]/.test(nextChar)) {
          // While the next character is also an identifier character
          increment(); // Actually increment the counter
          currToken.value += char;
        }
        newToken();
      } else {
        // Symbol
        switch (char) {
          case "\n":
          case ";":
            currToken.type = "terminator";
            currToken.value = char;
            newToken();
            break;
          case " ":
            currToken.column++;
            break;
          case undefined:
            throw "Lexer recieved undefined token";
          // break;
          case "/":
            if (/*nextChar !== undefined &&*/ nextChar === "/") {
              currToken.type = "comment";
              while (char && char !== "\n") {
                currToken.value += char;
                x++;
                char = programString[x];
                column++;
              }
              newToken();
              // if (char) {
              //   currToken.type = "newline";
              //   currToken.value = char;
              //   x--;
              //   increment();
              //   newToken();
              // } else {
              //   currToken.type = "eof";
              //   newToken();
              // }
              x--;
            } else {
              currToken.type = "symbol";
              currToken.value = char;
              newToken();
            }
            break;
          default:
            currToken.type = "symbol";
            currToken.value = char;
            newToken();
        }
      }
    }
    return tokens;
  };

  this.parse = function(tokens) {
    var x = -1; // Gets incremented to 0 immediately and updates the character
    var actions = [];
    var currAction = {
      type: "action",
      name: "",
      args: {}
    };
    function newAction() {
      actions.push(currAction);
      currAction = {
        type: "action",
        name: "",
        args: {}
      };
    } // Handling for unexpected weird tokens will be here, like "" or " " if they somehow end up being produced
    var token;
    var nextToken;
    var infiniteLoopStopper = 0;
    function increment() {
      infiniteLoopStopper++;
      if (infiniteLoopStopper > 1000) {
        throw "Parser has incremented over 1000 times";
      }
      x++;
      token = tokens[x];
      nextToken = tokens[x + 1];
      // if (char === "\n") {
      //   line++;
      //   column = 1;
      // } else {
      //   column++;
      // }
      // alert(token);
    }

    function handleError(msg, type) {
      if (msg === "" && type) {
        msg = `Expected type ${type}, got %t${
          token?.value ? " %v " : " "
        }instead`;
      } else if (!msg) {
        msg = `Unexpected token "%v"`;
      }
      currAction.type = "error";
      currAction.name = msg
        .replace(/%t/g, token?.type)
        .replace(
          /%v/g,
          token?.value.replace(/\n/g, "newline").replace("eof", "end of file")
        );
      currAction.args = token;
      token.error = msg;
      while (token && token.type !== "terminator") {
        increment();
      }
    }

    var infiniteLoopStopper = 0;
    tokens = tokens.filter(token => token.type !== "comment");
    while (x < tokens.length - 1) {
      increment();
      console.log(token);
      // console.log(token);
      switch (token.value) {
        case "goto":
        case "set":
        case "start":
        case "radius":
          currAction.name = token.value;
          // increment();
          // Eat arguments until a newline or a semicolon, then make a new Action
          while (token && token.type !== "terminator") {
            var name = "";
            increment();
            if (token?.type === "identifier") {
              name = token.value;

              if (nextToken?.value === ":") {
                increment();
                increment();
                if (token?.type === "number") {
                  currAction.args[name] = token.value * 1;
                  // console.log(JSON.stringify(currAction));
                } else {
                  handleError("", "number");
                }
              } else {
                currAction.args[name] = true;
                // console.log(JSON.stringify(currAction));
              }
            } else if (token && token.type !== "terminator") {
              // increment();
              console.log(token);
              handleError();
            }
          }
          // actions.push(token);
          newAction();
          break;
        case "eof":
        case "\n":
        case ";":
          // increment();
          console.log("terminator")
          break;
        default:
          // actions.push(token);
          handleError();
          newAction();
          break;
      }
    }
    console.log(actions);
    return actions;
  };

  this.analyze = function(actions) {
    var issues = [];
    var commands = actions.filter(action => action.type === "action");
    
    function handleError(msg, pos) {
      issues.push({ message: msg, token: actions[pos] });
    }

    if (actions[0]?.name !== "start") {
      handleError("The program does not begin with a starting position (use <code>start</code>)");
    }
    
    for(var x in commands){
      if(Object.entries(commands[x].args).length === 0){
        handleError(`There is a command <code>${commands[x].name}</code> without arguments`)
      }
    }

    return issues;
  };

  this.highlight = function(programString) {
    var tokens = this.lex(programString);
    var actions = this.parse(tokens);
    var errors = actions.filter(action => action.type === "error");
    var text = "";
    var reservedWords = this.reservedWords;
    var colorSet = document.getElementById("highContrast")?.checked ? 1 : 0;

    function prepText(token) {
      var returnText = "";
      if (token.value === "eof") {
        return "";
      }
      var coloredWords = {
        ";": ["grey", "white"]
      };
      for (var x of reservedWords) {
        coloredWords[x] = ["cyan", "cyan"];
      }
      var coloredTypes = {
        number: ["orange", "orange"],
        symbol: ["grey", "violet"],
        comment: ["rgb(100, 200, 100)", "lime"]
      };
      var value = token.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/\ /g, "&nbsp;")
        .replace(/\n/g, "<br />");
      if (coloredWords.hasOwnProperty(token.value)) {
        returnText = `<span style="color: ${coloredWords[token.value][colorSet]}; font-weight: bold;">${value}</span>`;
      } else if (coloredTypes.hasOwnProperty(token.type)) {
        returnText = `<span style="color: ${coloredTypes[token.type][colorSet]}">${value}</span>`;
      } else {
        returnText = value;
      }
      if (token.error) {
        returnText = `<span class="squiggle" title="${token.error}">${returnText}</span>`;
      }
      return returnText;
    }

    // Start at 1, 1
    var column = 1;
    var line = 1;
    var index = 0;
    // Repeatedly:
    var infiniteLoopStopper = 0;
    while (tokens[index] && infiniteLoopStopper < 1000000) {
      infiniteLoopStopper++;
      // Check the position of the next token
      // If it's at the right position:
      if (tokens[index].column <= column && tokens[index].line <= line) {
        // Add it
        text += prepText(tokens[index]);
        // Jump forwards by the correct number of characters or jump down a line for newlines
        if (tokens[index].value === "\n") {
          line++;
          column = 1;
        } else {
          column += tokens[index].value.length;
        }
        // Advance to the next token
        index++;
      } else {
        // Otherwise
        // Add a space
        text += "&nbsp;";
        column++;
      }
    }

    if (text.endsWith("<br />")) text += " ";

    return text;
  };

  this.parseProgram = function(programString) {
    var actions = this.parse(this.lex(programString));
    return {
      actions,
      issues: this.analyze(actions)
    };
  };
}

// This is just for handling stuff on this page and testing
function runRoScriptActions(actionObject, callback) {
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
    var res = `<br />
    ${
    actionObject.issues?.map(issue => `<div class='warn command-block'>
    ${issue.message}</div>`)
    }
    ${
      actionObject.actions
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
      ?.join("")
    }`;
  callback(res);
}

function parseProgram(programString) {
  document.getElementById("output").innerHTML = document.getElementById(
    "output"
  ).innerHTML = "Running...<br /><br />";
  runRoScriptActions(new GotoParser().parseProgram(programString), output => {
    document.getElementById("output").innerHTML = output;
  });
}

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

    // console.log(undoStack);
    codeUpdate(true); //calls hightlighter and parser (if enabled)
  });
}

function codeUpdate(parse) {
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
}

function sync_scroll(element) {
  /* Scroll result to scroll coords of event - sync with textarea */
  // let result_element = document.querySelector("#highlighting");
  let result_element = document.getElementById("highlighter");
  // Get and set x and y
  result_element.scrollTop = element.scrollTop;
  result_element.scrollLeft = element.scrollLeft;
}

codeUpdate(true);

// Code for the about page
function highlightBlocks() {
  var codeBlocks = [
    ...document.getElementsByTagName("code"),
    ...document.getElementsByClassName("code-block")
  ];
  for (var x of codeBlocks) {
    x.innerHTML = new GotoParser().highlight(x.innerText);
  }
}

function loadEntry(name) {
  if (!data) return;

  var cover = document.getElementsByClassName("cover")[0];
  if (!cover) return;

  cover.classList.remove("cover");
  void cover.offsetWidth;
  cover.classList.add("cover");

  setTimeout(() => {
    var { _main, _seealso, _availability, ...fields } =
      data[name] || data["Not found"];
    var mainElem = document.getElementById("content");
    // var footerElem

    document.getElementById("heading").innerHTML = name;
    mainElem.innerHTML = _main;

    for (var x in Object.entries(fields)) {
      var [title, content] = Object.entries(fields)[x];
      //     <div class="divider"></div>
      mainElem.innerHTML += `<div class='divider'></div><h2>${title}</h2>${content}`;
    }
    if (_seealso) {
      mainElem.innerHTML += `<div class='divider'></div><h2>See also:</h2>${_seealso
        .map(
          entry =>
            `<span class='doclink' onclick='loadEntry("${entry}")'>${entry}</span>`
        )
        .join(", ")}`;
    }
    highlightBlocks();
  }, 300);
}

function toggleCollapse(name) {
  var settingsPanel = document.getElementById(name);
  if (!settingsPanel) return "I lost the game";

  settingsPanel.style.animationDuration = "0.8s";
  if (
    settingsPanel.classList.contains("collapsed") ^
    settingsPanel.classList.contains("expanded")
  ) {
    settingsPanel.classList.toggle("expanded");
  }
  settingsPanel.classList.toggle("collapsed");
}

var visualeditor = document.getElementById('visualeditor');
visualeditor.getContext('2d');
visualeditor.drawRect(0,0,50,50);
function visualEditor(){
  if(visualeditor.style.display === 'auto' || VEactivated === true){
    //deactivating the visual editor
    VEactivated = false;
    document.getElementById('editor').style.visibility = 'visible';
    document.getElementById('editor').style.display = "initial";
    document.getElementById('highlighter').style.visibility = 'visible';
    document.getElementById('highlighter').style.display = "initial";
    visualeditor.style.display = 'none';
    visualeditor.style.visibility = 'hidden';
    console.log('deactivated');
    
  }else if(visualeditor.style.display === false || VEactivated === false){
    //activating the visual editor
    VEactivated = true;
    document.getElementById('editor').style.visibility = 'hidden';
    document.getElementById('editor').style.display = "none";
    document.getElementById('highlighter').style.visibility = 'hidden';
    document.getElementById('highlighter').style.display = "none";
    visualeditor.style.display = 'block';
    visualeditor.style.visibility = 'visible';
    console.log('activated');
    visualeditor.getContext('2d');
    visualeditor.beginPath();
    visualeditor.rect(20,20,100,100);
    visualeditor.stroke();
    
    
  }
}

if(localStorage.ok){
//   var inputs = document.getElementsByTagName("input");
//   for(var i in inputs){
    
//   }
}else{
  if(confirm("This page would like to use localStorage to save settings and programs. Is that okay?")){
    localStorage.ok = true;
  };
}

document.getElementById("cover")?.classList.add("cover");
loadEntry("Welcome!");