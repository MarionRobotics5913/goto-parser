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
  alert(programString);
  // Lexor
  var tokens = [];
  var currToken = "";
  var pos = [1, 1];
  for (var x in programString) {
    if (x === " ") {
      // End of token
      if (typeof currToken * 1 === "number") {
        tokens.push(currToken * 1);
      } else if (currToken !== "") {
        tokens.push(currToken);
      }
    } else {
      currToken += x;
    }
  }
  return tokens;
}

function runRoScriptAction(actionObject) {}
