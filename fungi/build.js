// apple's least favorite thing is when someone doesn't have connection
// so ios can't view local html files in browsers (ie with javascript).
// it would be interesting if this builder could expand to a fully html
// version (templates? etc) but that would be insanity methinks so i'll just
// have to use safari for now >.< T_T

const fs = require("fs")
const inline = require("web-resource-inliner")
inline.html(
  {
    fileContent: fs.readFileSync("./index.html"),
    relativeTo: ".",
  },
  (err, result) => {
    if (err) { throw err }
    result = result.replace("getKey() // build: replace", `key = JSON.parse(\`${fs.readFileSync("./arora.json")}\`);\npopulateGenera();`) // javascript my beloved
    fs.writeFileSync("./dkey-bundled.html", result)
  }
)