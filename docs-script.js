import GotoParser from "./modules/parser.js";

// Credit to StackOverflow: https://stackoverflow.com/questions/4313841/insert-a-string-at-a-specific-index
if (!String.prototype.splice) {
  /**
   * {JSDoc}
   *
   * The splice() method changes the content of a string by removing a range of
   * characters and/or adding new characters.
   *
   * @this {String}
   * @param {number} start Index at which to start changing the string.
   * @param {number} delCount An integer indicating the number of old chars to remove.
   * @param {string} newSubStr The String that is spliced in.
   * @return {string} A new string with the spliced substring.
   */
  String.prototype.splice = function(start, delCount, newSubStr) {
    return (
      this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount))
    );
  };
}

var data;

// Code for the about page
window.highlightBlocks = function() {
  var codeBlocks = [
    ...document.getElementsByTagName("code"),
    ...document.getElementsByClassName("code-block")
  ];
  for (var x of codeBlocks) {
    x.innerHTML = new GotoParser().highlight(x.innerText);
  }
}

window.loadEntry = function(name) {
  if (!data) return;

  var cover = document.getElementsByClassName("cover")[0];
  if (!cover) return;

  cover.classList.remove("cover");
  void cover.offsetWidth;
  cover.classList.add("cover");

  setTimeout(() => {
    var { _main, _seealso, _availability, ...fields } =
      data[name] || data["Not found"];
    var mainElem = document.getElementById("content");
    // var footerElem

    document.getElementById("heading").innerHTML = name;
    mainElem.innerHTML = _main;

    for (var x in Object.entries(fields)) {
      var [title, content] = Object.entries(fields)[x];
      //     <div class="divider"></div>
      mainElem.innerHTML += `<div class='divider'></div><h2>${title}</h2>${content}`;
    }
    if (_seealso) {
      mainElem.innerHTML += `<div class='divider'></div><h2>See also:</h2>${_seealso
        .map(
          entry =>
            `<span class='doclink' onclick='loadEntry("${entry}")'>${entry}</span>`
        )
        .join(", ")}`;
    }
    window.highlightBlocks();
  }, 300);
}

document.getElementById("cover")?.classList.add("cover");
window.loadEntry("Welcome!");
