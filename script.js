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

function parseGotoScript(programString){
  var lexer;
  var parser;
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
  runRoScriptActions(parseGotoScript(programString), output => {
    document.getElementById("output").innerHTML += output + "<br />";
  });
}

// Add syntax highlighting to the editor element
// Code from Brian Mearns: https://codepen.io/brianmearns/pen/YVjZWw
const editor = document.getElementById('program');
const selectionOutput = document.getElementById('selection');

function getTextSegments(element) {
    const textSegments = [];
    Array.from(element.childNodes).forEach((node) => {
        switch(node.nodeType) {
            case Node.TEXT_NODE:
                textSegments.push({text: node.nodeValue, node});
                break;
                
            case Node.ELEMENT_NODE:
                textSegments.splice(textSegments.length, 0, ...(getTextSegments(node)));
                break;
                
            default:
                throw new Error(`Unexpected node type: ${node.nodeType}`);
        }
    });
    return textSegments;
}

editor.addEventListener('input', updateEditor);

function updateEditor() {
    const sel = window.getSelection();
    const textSegments = getTextSegments(editor);
    const textContent = textSegments.map(({text}) => text).join('');
    let anchorIndex = null;
    let focusIndex = null;
    let currentIndex = 0;
    textSegments.forEach(({text, node}) => {
        if (node === sel.anchorNode) {
            anchorIndex = currentIndex + sel.anchorOffset;
        }
        if (node === sel.focusNode) {
            focusIndex = currentIndex + sel.focusOffset;
        }
        currentIndex += text.length;
    });
    
    editor.innerHTML = renderText(textContent);
    
    restoreSelection(anchorIndex, focusIndex);
}

function restoreSelection(absoluteAnchorIndex, absoluteFocusIndex) {
    const sel = window.getSelection();
    const textSegments = getTextSegments(editor);
    let anchorNode = editor;
    let anchorIndex = 0;
    let focusNode = editor;
    let focusIndex = 0;
    let currentIndex = 0;
    textSegments.forEach(({text, node}) => {
        const startIndexOfNode = currentIndex;
        const endIndexOfNode = startIndexOfNode + text.length;
        if (startIndexOfNode <= absoluteAnchorIndex && absoluteAnchorIndex <= endIndexOfNode) {
            anchorNode = node;
            anchorIndex = absoluteAnchorIndex - startIndexOfNode;
        }
        if (startIndexOfNode <= absoluteFocusIndex && absoluteFocusIndex <= endIndexOfNode) {
            focusNode = node;
            focusIndex = absoluteFocusIndex - startIndexOfNode;
        }
        currentIndex += text.length;
    });
    
    sel.setBaseAndExtent(anchorNode,anchorIndex,focusNode,focusIndex);
}

function renderText(text) {
    const words = text.split(/(\s+)/);
    const output = words.map((word) => {
        if (word === 'bold') {
            return `<strong>${word}</strong>`;
        }
        else if (word === 'red') {
            return `<span style='color:red'>${word}</span>`;
        }
        else {
            return word;
        }
    })
    return output.join('');
}

updateEditor();