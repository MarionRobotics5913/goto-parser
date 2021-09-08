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

// function parseRoScript(programString) {
//   // Lexer
//   var tokens = [];
//   var currToken = "";

//   function appendCurrToken() {
//     if (currToken.endsWith("//")) {
//       currToken = currToken.slice(0, -2);
//     }
//     if (typeof currToken * 1 === "number") {
//       tokens.push(currToken * 1);
//     } else if (currToken !== "") {
//       tokens.push(currToken);
//     }
//     currToken = "";
//   }

//   //   var x = 0;

//   //   while (x < programString.length) {
//   for (var x in programString) {
//     var char = programString[x];
//     if (currToken.endsWith("//")) {
//       // If a comment started
//       if (char !== "\n") {
//         continue;
//       }
//     }
//     switch (char) {
//       case " ":
//         appendCurrToken();
//         break;
//       case "\n":
//         appendCurrToken();
//         tokens.push("newline");
//         break;
//       default:
//         currToken += char;
//     }
//     // if (char === " ") {
//     //   appendToken();
//     // } else if(char === "\n"){
//     //   appendToken();
//     //   tokens.push("newline");
//     // }else {
//     //   currToken += char;
//     // }
//     // x++;
//   }
//   // Add on the last token
//   appendCurrToken();
//   tokens.push("end of file");
//   console.log(tokens);

//   // Parser
//   var actions = [];
//   var currIndex = 0; // Index instead of object because of possible shallow cloning issues
//   var line = 1;
//   function createError(type, data) {
//     switch (type) {
//       case "token":
//         return [
//           {
//             command: "error",
//             message: `Parsing error: Unexpected token "${data}" (line ${line})`
//           }
//         ];
//         break;
//       case "number":
//         return [
//           {
//             command: "error",
//             message: `Parsing error: Expected a number after ${data[0]}, got ${
//               data[1]
//             } instead (line ${line})`
//           }
//         ];
//         break;
//     }
//   }
//   var skipLoops = 0;
//   for (var x in tokens) {
//     if (skipLoops) {
//       skipLoops--;
//       continue;
//     }
//     var token = tokens[x]; // Just to make readability a bit better
//     switch (token) {
//       case "newline":
//         line++;
//         currIndex++;
//         break;
//       case "end of file":
//         break;
//       case "goto":
//         if (actions[currIndex]) {
//           return createError("token", "goto");
//         }
//         actions[currIndex] = {
//           command: "goto",
//           args: {},
//           type: "stop",
//           flow: "await"
//         };
//         break;
//       default:
//         if (!actions[currIndex]) {
//           return createError("token", token);
//         }
//         switch (actions[currIndex].command) {
//           case "goto":
//             if (token.endsWith(":")) {
//               // Argument for goto
//               if (!isNaN(parseFloat(tokens[x * 1 + 1]))) {
//                 // Make sure it's not NaN
//                 console.log(
//                   "Number " +
//                     parseFloat(tokens[x * 1 + 1]) +
//                     ", " +
//                     tokens[x * 1 + 1]
//                 );
//                 actions[currIndex].args[token.slice(0, -1)] = parseFloat(
//                   tokens[x * 1 + 1]
//                 );
//                 skipLoops = 1;
//               } else {
//                 console.log("Not number " + token);
//                 return createError("number", [token, tokens[x * 1 + 1]]);
//               }
//             } else {
//               return createError("token", token);
//             }
//             break;
//         }
//     }
//   }
//   return actions;
// }

function GotoParser() {
  this.lex; // Lexer
  this.parse; // Parser
  this.analyze; // Semantic analyzer
  this.highlight; // Syntax highlighter that returns HTML content
  this.reservedWords = ["goto"];

  this.lex = function(programString) {
    var x = -1; // Gets incremented to 0 immediately and updates the character
    var column = 0;
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
        throw "Lexer has looped over 1000 times";
      }
      x++;
      char = programString[x];
      nextChar = programString[x + 1];
      if (char === "\n") {
        line++;
        column = 0;
      } else {
        column++;
      }
    }
    /*
      loop over characters
      check starting character and decide token type
      eat valid characters until you hit an invalid
      break
      */
    var infiniteLoopStopper = 0;
    while (x < programString.length && infiniteLoopStopper < 50) {
      // while(infiniteLoopStopper<15){
      infiniteLoopStopper++;
      increment(); //"goto x: 0"
      // var char = programString[x];
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
            currToken.type = "symbol";
            currToken.value = char;
            newToken();
          case " ":
            currToken.column++;
            break;
          case undefined:
            alert("Undefined");
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
    return tokens;
  };

  this.analyze = function(actions) {
    return actions;
  };

  this.highlight = function(programString) {
    var tokens = this.lex(programString);
    var text = "";

    function prepText(token) {
      switch (token.type) {
        default:
          return token.value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/\ /g, "&nbsp;")
            .replace(/\n/g, "<br />");
      }
    }

    // Start at 1, 1
    var column = 1;
    var line = 1;
    var index = 100;
    // Repeatedly:
    while (tokens[index]) {
      // Check the position of the next token
      // If it's at the right position:
      if (tokens[index].column === column && tokens[index].line === line) {
        // Add it
        text += prepText(tokens[index]);
        // Jump forwards by the correct number of characters or jump down a line for newlines
      }
      // Otherwise
      // Add a space
    }

    if (text.endsWith("<br />")) text += " ";

    return text.replace(
      /goto/g,
      "<span style='color: cyan; font-weight: bold;'>goto</span>"
    );
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
  callback(`Output:<br />${actionObject.map(JSON.stringify).join("<br />")}`);
}

function parseProgram(programString) {
  document.getElementById("output").innerHTML = document.getElementById(
    "output"
  ).innerHTML = "Running...<br /><br />";
  runRoScriptActions(new GotoParser().parseProgram(programString), output => {
    document.getElementById("output").innerHTML += output + "<br />";
  });
}

// Actual page functions

document.getElementById("editor").value = document
  .getElementById("editor")
  .value.trim();

function codeUpdate() {
  // Run every time the textarea updates
  var textarea = document.getElementById("editor");
  var highlighter = document.getElementById("highlighter");

  highlighter.height = textarea.clientHeight;
  highlighter.innerHTML = new GotoParser().highlight(textarea.value);
  // alert(text);
  parseProgram(textarea.value);
}

codeUpdate();

function sync_scroll(element) {
  /* Scroll result to scroll coords of event - sync with textarea */
  // let result_element = document.querySelector("#highlighting");
  let result_element = document.getElementById("highlighter");
  // Get and set x and y
  result_element.scrollTop = element.scrollTop;
  result_element.scrollLeft = element.scrollLeft;
}
