export default function GotoParser() {
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
    "iltg",
    "if",
    "else",
    "import",
    "return",
    "macro"
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
                currToken.value += char;
              increment();
                currToken.type = nextChar === "!"?"meta":"comment";                
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
      args: {},
      tokens: []
    };
    function newAction() {
      actions.push(currAction);
      currAction = {
        type: "command",
        name: "",
        args: {},
        tokens: []
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
      currAction.tokens.push(token);
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
      // console.log(token);
      // console.log(token);
      switch (token.value) {
        case "goto":
        case "set":
        case "start":
        case "radius":
          currAction.name = token.value;
          // increment();
          // Eat arguments until a newline or a semicolon, then make a new Action
          var idents = [];
          while (token && token.type !== "terminator") {
            var name = "";
            increment();
            if (token?.type === "identifier") {
              name = token.value;
              // console.log(idents);
              for (var i in idents) {
                var ident = idents[i]; // Because JS
                if (name === ident) {
                  handleError(`Duplicate argument '${ident}' in action`, "");
                }
              }
              idents.push(token.value);
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
              // console.log(token);
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
          // console.log("terminator");
          break;
        case "{":
          console.log("Code block");
          currAction.name = "block";
          currAction.type = "block";
          var stopInfinite = 0;
          var blockTokens = [];
          var bracketLevel = 1;
          while (nextToken && bracketLevel > 0) {
            stopInfinite++;
            if (stopInfinite > 1000) {
              console.log("Block code looped over 1000 times");
              throw "AAAA";
            }
            // console.log(token);
            increment();
            if (token.value === "}") {
              bracketLevel--;
              if (bracketLevel === 0) {
                continue;
              }
            }
            if (token.value === "{") {
              bracketLevel++;
              // continue;
            }
            if (token.value === "eof") {
              handleError(`No ending bracket`, "");
              newAction();
              break;
            }
            blockTokens.push(JSON.parse(JSON.stringify(token)));
          }
          // console.log(blockTokens.map(a => a.value).join(", "));
          currAction.args = this.parse(blockTokens);
          newAction();
          break;
        default:
          // actions.push(token);
          handleError();
          newAction();
          break;
      }
    }
    // console.log(actions);
    return actions;
  };

  this.analyze = function(actions) {
    var issues = [];
    var commands = actions.filter(action => action.type === "action");

    function handleError(msg, pos) {
      var token = actions[pos]?.tokens[0];
      issues.push({
        message: msg + (token ? ` (at ${token.line}:${token.column})` : ""),
        action: actions[pos]
      });
    }

    if (
      actions[0]?.name !== "start" ||
      actions[0]?.args[0]?.includes("x") ||
      actions[0]?.args[0]?.inclueds("y")
    ) {
      handleError(
        "The program does not begin with a functional starting position (use <code>start</code>)",
        0
      );
    }

    for (var x in commands.filter(c => c.type === "command")) {
      if (Object.entries(commands[x].args).length === 0) {
        handleError(
          `There is a command <code>${commands[x].name}</code> without arguments`,
          x
        );
      }
    }
    for(var x in commands.filter(c => c.type === "block")) {
      console.log(x);
      if (Object.entries(commands[x].args).length === 0) {
        handleError(
          `Empty code block`,
          x
        );
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
        comment: ["rgb(100, 200, 100)", "lime"],
        meta: ["indigo", "purple"]
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
