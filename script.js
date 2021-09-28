/*
RoScript

Parse to
{
  command: "goto"
  args: {
    x: value
    y: value
  }
  type: "await"
}
*/

// Credit to StackOverflow: https://stackoverflow.com/questions/4282151/is-it-possible-to-ping-a-server-from-javascript
function ping(host, port, pong) {
  var started = new Date().getTime();

  var http = new XMLHttpRequest();

  http.open("GET", "http://" + host + ":" + port, /*async*/ true);
  http.onreadystatechange = function() {
    if (http.readyState == 4) {
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
    var name = window.prompt("What should the program be called?");
    if (!name) return;
    // Robot is at either http://192.168.43.1:8080 or http://192.168.49.1:8080
    // Process:
    // 1. Build Java file
    // 2. Send POST request to <server>/java/file/upload
    //   a. Send file as "file" in a multipart form
    var responseRecieved = false;
    function part2(millis) {
      if(responseRecieved) return;
      responseRecieved = true;
      
      var XHR = new XMLHttpRequest();
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
  this.lex; // Lexer
  this.parse; // Parser
  this.analyze; // Semantic analyzer
  this.highlight; // Syntax highlighter that returns HTML content
  this.reservedWords = ["goto", "set", "radius", "cont", "stop", "start"];

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
      if (infiniteLoopStopper > 1000) {
        throw "Lexer has incremented over 1000 times";
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
        currToken.type = "eof";
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
            currToken.type = "newline";
            currToken.value = char;
            newToken();
            break;
          case " ":
            currToken.column++;
            break;
          case undefined:
            throw "Lexer recieved undefined token";
            break;
          case "/":
            if (nextChar !== undefined && nextChar === "/") {
              currToken.type = "comment";
              while (char && char !== "\n") {
                currToken.value += char;
                x++;
                char = programString[x];
                column++;
              }
              newToken();
              if (char) {
                currToken.type = "symbol";
                currToken.value = char;
                x--;
                increment();
                newToken();
              } else {
                currToken.type = "eof";
                newToken();
              }
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
      name: "",
      arguments: {}
    };
    function newToken() {
      actions.push(currAction);
      currAction = {
        type: undefined,
        value: ""
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

    var infiniteLoopStopper = 0;
    tokens = tokens.filter(token => token.type !== "comment");
    while (x < tokens.length - 1) {
      increment();
      // console.log(token);
      switch (token.value) {
        case "goto":
        case "set":
        case "start":
        case "radius":
          // Eat arguments until a newline or a semicolon, then make a new Action

          actions.push(token);
          break;
        default:
          // actions.push(token);
          break;
      }
    }
    return actions;
  };

  this.analyze = function(actions) {
    return actions;
  };

  this.highlight = function(programString) {
    var tokens = this.lex(programString);
    var text = "";
    var reservedWords = this.reservedWords;
    var colorSet = document.getElementById("highContrast")?.checked ? 1 : 0;

    function prepText(token) {
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
        return `<span style="color: ${coloredWords[token.value][colorSet]}; font-weight: bold;">${value}</span>`;
      } else if (coloredTypes.hasOwnProperty(token.type)) {
        return `<span style="color: ${coloredTypes[token.type][colorSet]}">${value}</span>`;
      } else {
        return value;
      }
    }

    // Start at 1, 1
    var column = 1;
    var line = 1;
    var index = 0;
    // Repeatedly:
    var infiniteLoopStopper = 0;
    while (tokens[index] && infiniteLoopStopper < 500) {
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
    return this.analyze(this.parse(this.lex(programString)));
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
  callback(`<br />${actionObject.map(JSON.stringify).join("<br />")}`);
}

function parseProgram(programString) {
  document.getElementById("output").innerHTML = document.getElementById(
    "output"
  ).innerHTML = "Running...<br /><br />";
  runRoScriptActions(new GotoParser().parseProgram(programString), output => {
    document.getElementById("output").innerHTML = output;
  });
}

// Actual page functions

var editor = document.getElementById("editor");
if (editor) {
  editor.value = editor.value.trim();
  editor.addEventListener("keydown", event => {
    // Function here :)
    if (event.key === "l" && event.ctrlKey) {
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
    if (event.key === "/" && event.ctrlKey) {
      // alert(editor.type);
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

      codeUpdate(false); //calls hightlighter
      event.preventDefault();
      event.stopPropagation();
    }
    if (event.keyCode === 40 && event.ctrlKey) {
      //ctrl + down
      var position = editor.selectionStart;

      var line = [];
      for (var i = position - 1; i > 0; i--) {
        if (editor.value[i] !== "\n") {
          line.push(editor.value[i]);
        } else {
          line = line.reverse();
          break;
        }
      }
      alert(line);
      event.preventDefault();
      event.stopPropagation();
    }
    if (event.keyCode === 9) {
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
      codeUpdate(false); //calls hightlighter
      event.preventDefault();
      event.stopPropagation();
    }
    if (event.keyCode === 9 && event.shiftKey) {
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
      }

      codeUpdate(false); //calls hightlighter
      event.preventDefault();
      event.stopPropagation();
    }
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

document.getElementById("cover")?.classList.add("cover");
loadEntry("Welcome!");
