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
  var line = 1;
  function createError(type, data){
    switch(type){
      case "token":
        return [{
          command: "error",
          message: ""
        }];              
        break;
    }
  }
  for (var x in tokens) {
    switch (tokens[x]) {
      case "newline":
        line++;
        break;
      case "goto":
        if(actions[currIndex].command){
          errorMessage = `Parsing error: Unexpected token goto on line ${line}`          
        }
        break;
      default:
        errorMessage = `Parsing error: Unexpected token ${tokens[x]} on line ${line}`
    }
    if(errorMessage!==""){
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
        callback(`goto: ${JSON.stringify(actionObject[x].arguments)}`);
        break;
      default:
        callback(`Unrecognized command ${actionObject[x].command} run`);
    }
  }
}

function runProgram(programString) {
  document.getElementById("output").innerHTML = document.getElementById(
    "output"
  ).innerHTML = "Running...<br /><br />";
  runRoScriptActions(parseRoScript(programString), output => {
    document.getElementById("output").innerHTML += output + "<br />";
  });
}
