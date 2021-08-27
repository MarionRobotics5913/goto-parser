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
  appendCurrToken();
  tokens.push("fileend");
  console.log(tokens);

  // Parser
  var actions = [];
  var currIndex = 0; // Index instead of object because of possible shallow cloning issues
  var line = 1;
  function createError(type, data) {
    switch (type) {
      case "token":
        return [
          {
            command: "error",
            message: `Parsing error: Unexpected token "${data}" (line ${line})`
          }
        ];
        break;
      case "number":
        return [
          {
            command: "error",
            message: `Parsing error: Expected a number after ${data[0]}, got ${data[1]} instead (line ${line})`
          }
        ];
        break;
    }
  }
  var skipLoops = 0;
  for (var x in tokens) {
    if(skipLoops){
      skipLoops--;
      continue;
    }
    var token = tokens[x]; // Just to make readability a bit better
    switch (token) {
      case "newline":
        line++;
        currIndex++;
        break;
      case "fileend":
        
        break;
      case "goto":
        if (actions[currIndex]) {
          return createError("token", "goto");
        }
        actions[currIndex] = {
          command: "goto",
          args: {},
          type: "stop",
          flow: "await",
        };
        break;
      default:
        if (!actions[currIndex]) {
          return createError("token", token);
        }
        switch(actions[currIndex].command){
          case "goto":
            if(token.endsWith(":")){ // Argument for goto
              if(typeof parseFloat(tokens[x*1+1]) === "number" && parseFloat(tokens[x*1+1]) !== NaN){
                console.log("Number " + parseFloat(tokens[x*1+1]) + ", " + tokens[x*1+1]);
                actions[currIndex].args[token.slice(0, -1)] = parseFloat(tokens[x*1+1]);
                skipLoops = 1;
              } else {
                console.log("Not number " + token);
                return createError("number", [token, tokens[x*1+1]]);
              }
            } else {
              return createError("token", token);
            }
            break;
        }
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
        callback(`goto: ${JSON.stringify(actionObject[x].args)}`);
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
