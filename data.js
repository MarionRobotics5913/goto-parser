var data = {
  ["Welcome!"]: {
    _main:
      "This is a guide on how to use Goto, a language developed by FTC team 5913 for a fast, low-effort, and more beginner-friendly way to program autonomous modes that operate smoothly. To get started, check out some of the pages listed below.",
    _seealso: ["goto", "Comments", "set"]
  },
  ["Not found"]: {
    _main: "Oops! Looks like you found an entry that hasn't been created yet.",
    _seealso: ["Welcome!"]
  },
  goto: {
    _main: "Main body content",
    Syntax: "Syntax content",
    Examples: `Example content<br>
    Inline code block: <code>goto x: 0.4 y: 0.7 stop</code><br>
    External block:
    <div class="code-block">
      goto x: 0 y: 0 cont<br>
      set x: 0.9 y: 0.1 stop<br>
      // It even highlights automatically!<br>
      // Apparently not code blocks yet though. I'm still working on that one. 
    </div>`,
    Test: "Random extra field for more bulk to test on",
    Yo: "Procgen pages are epic",
    _seealso: ["set", "cont", "stop"]
  },
  Comments: {
    _main: "Haven't actually written this one yet blah blah blah",
    Examples: "",
    _seealso: ["goto", "set"]
  }
};
