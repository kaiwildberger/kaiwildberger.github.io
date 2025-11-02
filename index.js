const id = e => document.getElementById(e);
const rdlist = id("readinglist")

Array.from(id("bottomsettings").children).filter(x => x.tagName == "INPUT").forEach(e => {
    e.addEventListener("change", (ev) => {
        document.body.style.fontFamily = (ev.currentTarget.checked) ? "hand-kw" : "serif";
        document.body.style.fontSize = (ev.currentTarget.checked) ? "2.5em" : "1em";
    })
})

fetch("./booklist")
    .then(res => {return res.text()})
    .then(text => {
        text = text.includes("Cannot GET") ? "fail" : text
        constructBooks(text)
    })
    .catch(error => {
        constructBooks("fail")
    })

function constructBooks(text) {
    // echo "\nFrederick Seidel" >> booklist
    if(text === "fail") {
        rdlist.innerHTML = '<p>Oops! Couldn\'t fetch book list.</p>'
    }
    text = text.split("\n")
    for(let i in text) {
        rdlist.innerHTML += "<ul>"+text[i]+"</ul>"
    }
}