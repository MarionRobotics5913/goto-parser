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
  // Lexor
  var tokens = [];
  var currToken = "";
  var pos = [1, 1];
  for (var x in programString) {
    var char = programString[x];
    if (char === " ") {
      // End of token
      if (typeof currToken * 1 === "number") {
        tokens.push(currToken * 1);
      } else if (currToken !== "") {
        tokens.push(currToken);
      }
      currToken = "";
    } else {
      currToken += char;
    }
  }
  // Add on the last token
  tokens.push(currToken);
  return tokens;
}

function runRoScriptAction(actionObject) {}
