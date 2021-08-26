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
  
  function appendCurrToken(){
      if (typeof currToken * 1 === "number") {
        tokens.push(currToken * 1);
      } else if (currToken !== "") {
        tokens.push(currToken);
      }
      currToken = "";    
  };
  
  var x = 0;
  
  for (var x in programString) {
    var char = programString[x];
    switch(char){
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
  }
  // Add on the last token
  tokens.push(currToken);
  return tokens;
  
  
}

function runRoScriptAction(actionObject) {
  
}
