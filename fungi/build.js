const fs = require("fs")
const inline = require("web-resource-inliner")

inline.html(
  {
    fileContent: readFileSync("./index.html"),
    relativeTo: ".",
  },
  (err, result) => {
    if (err) { throw err }
    result = result.replace("getKey() // build: replace", `key = JSON.parse(\`${fs.readFileSync("./arora.json")}\`); populateGenera();`) // javascript my beloved
    fs.writeFileSync("./dkey-bundled.html", result)
  }
)


function readFileSync(file) {
  const contents = fs.readFileSync(file, "utf8")
  return process.platform === "win32" ? contents.replace(/\r\n/g, "\n") : contents
}