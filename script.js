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

function parseRoScript(programString) {
  // Lexer
  var tokens = [];
  var currToken = "";

  function appendCurrToken() {
    if (currToken.endsWith("//")) {
      currToken = currToken.slice(0, -2);
    }
    if (typeof currToken * 1 === "number") {
      tokens.push(currToken * 1);
    } else if (currToken !== "") {
      tokens.push(currToken);
    }
    currToken = "";
  }

  //   var x = 0;

  //   while (x < programString.length) {
  for (var x in programString) {
    var char = programString[x];
    if (currToken.endsWith("//")) {
      // If a comment started
      if (char !== "\n") {
        continue;
      }
    }
    switch (char) {
      case " ":
        appendCurrToken();
        break;
      case "\n":
        appendCurrToken();
        tokens.push("newline");
        break;
      default:
        currToken += char;
    }
    // if (char === " ") {
    //   appendToken();
    // } else if(char === "\n"){
    //   appendToken();
    //   tokens.push("newline");
    // }else {
    //   currToken += char;
    // }
    // x++;
  }
  // Add on the last token
  tokens.push(currToken);
  // return tokens;

  // Parser
  var actions = [];
  var currIndex = 0; // Index instead of object because of possible shallow cloning issues
  for (var x in tokens) {
    switch (tokens[x]) {
      default:
        return {
          command: "error",
          message: `Unexpected token ${x}`
        };
    }
  }
  return actions;
}

// This is just for handling stuff on this page and testing
function runRoScriptActions(actionObject, callback) {
  for (var x in actionObject) {
    switch (actionObject[x].command) {
      case "error":
        callback(`Error: ${actionObject[x].message}`);
        return actionObject[x].message;
        break;
      case "goto":
        callback(`Unrecognized command ${actionObject[x].command} run`);
        break;
      default:
        callback(`Unrecognized command ${actionObject[x].command} run`);
    }
  }
}

function runProgram(programString) {
  document.getElementById("output").innerHTML = "Running...";
  runRoScriptActions(parseRoScript(programString), output => {
    document.getElementById("output").innerHTML += output + "<br />";
  });
}
