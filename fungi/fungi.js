const id = e => { return document.getElementById(e) }
var key, globalGenus, coupletList = []
const choiceArea = id('choices'), wholekey = id('wholekey'), backtrace = id("backtrace")
class Couplet {
    // num is int number of couplet; base and prime are 1. and 1' respectively
    // base and prime look like ["Cap bright red when fresh", 2] or ["Cap white to buff", "albus"]
    // references is for search backtracing
    constructor(num, base, prime) {
        this.num = num
        this.base = base
        this.prime = prime
        this.references = [base[1], prime[1]]
        coupletList.push(this)
    }
}

/// TODO
// - backtrace doesn't work on non-unique species (Amanita muscaria) due to set flattening confusion
// - make look better on mobile (larger?)
// 
// ref https://keycouncil.svims.club/council/

function getKey() {
    fetch('./arora.json')
   .then(response => {
       if (!response.ok) {
           throw new Error("Couldn't load key; got " + response.status);
       }
       return response.json();
   })
   .then(json => {
        key = json
        populateGenera()
   })
}
getKey() // build: replace

function clearChoices() {
    choiceArea.innerHTML = ""
}

function createPairEntry(couplet) {
    let container = document.createElement("div")
    container.className = "couplet"
    container.innerHTML = `<p>${couplet["num"]}.  ${couplet["base"][0]} ..... <i>${couplet["base"][1]}</i></p><p>${couplet["num"]}'  ${couplet["prime"][0]} ..... <i>${couplet["prime"][1]}</i></p>`
    return container
}

function createChoice(list) {
    let final = []
    let container = document.createElement("div")
    container.className = "couplet"
    // container.setAttribute("data-name", e)
    list.forEach(e => {
        let q = document.createElement("div")
        let idx = list.indexOf(e)
        q.innerHTML = `<input class="choice" type="radio" id="radio-${idx}" name="${idx}" value="${e}"/><label for="radio-${idx}">${e}</label>`
        container.appendChild(q)
        if(list.indexOf(e) == 0) { q.setAttribute("data-pos", "base") }
        else q.setAttribute("data-pos", "prime")
        final.push(container)
    })
    // if(final.length == 2) {
    //     final[0].setAttribute("data-pos", "base")
    //     final[1].setAttribute("data-pos", "prime")
    // }
    return final;
}

async function populateGenera() {
    // special create choice at the beginning
    let keylist = Object.keys(key), finalarray = []
    let container = document.createElement("select")
    for(let i in keylist) {
        // console.log(i)
        let e = keylist[i]
        // console.log(keylist[i])
        let q = document.createElement("option")
        q.setAttribute("data-name", e)
        q.setAttribute("value", e)
        q.innerText = e[0].toUpperCase() + e.slice(1)
        // q.innerHTML = `<input class="choice" type="radio" id="radio-${i}" name="${i}" value="${e}"/><label for="radio-${i}">${e[0].toUpperCase()}${e.slice(1)}</label>`
        container.appendChild(q)
    }
    container.addEventListener("change", () => { // me when single letter varaible
            // click.preventDefault() // this solves the double fn calls (silly me)
            // console.log(q)
            globalGenus = container.value
            let subkey = key[globalGenus]
            for(let w in subkey) { // single letter variable moment
                wholekey.appendChild(createPairEntry(subkey[w]))
            }
            // wholekey.innerHTML = wholeFinal
            startKeyFor(globalGenus)
        })
    container.value = ""
    choiceArea.appendChild(container)
}

function cycle(couplet) {
    clearChoices()
    createChoice([`${couplet["num"]}.  ${couplet["base"][0]} ..... ${couplet["base"][1]}`, `${couplet["num"]}'  ${couplet["prime"][0]} ..... ${couplet["prime"][1]}`]).forEach(container => {
        choiceArea.appendChild(container)
        Array.from(container.children).forEach(e => {
            let p = e.getAttribute("data-pos")
            e.onclick = q => { // this is still getting called twice on the same elements but this fixes it ez style
                q.preventDefault()
                if (parseInt(couplet[p][1]) > 0) {
                    cycle(key[globalGenus][couplet[p][1]])
                } else { // species
                    choiceArea.innerHTML += `<h2>${globalGenus[0].toUpperCase()}. ${e.innerText.split("..... ")[1]}</h2>`
                }
            }
        })
    })
}

function startKeyFor(genus) {
    globalGenus = genus
    clearChoices()
    coupletList = []
    Array.from(Object.keys(key[globalGenus])).forEach(i => {
        new Couplet(key[globalGenus][i].num, key[globalGenus][i].base, key[globalGenus][i].prime)
    }) // populate coupletList with actual couplets
    populateBacktrace()
    cycle(key[genus]["1"])
}

function refMatches({references}, spec) {
    let match = false
    references.forEach(e => {
        if(typeof e === "number") return; // javascript my beloved
        if(spec === "") { // looking for any species at all
            match = true
            return
        }
        if(spec.includes(' ') && e === spec) { // this is "brevipes and others"
            match = true
            return
        }
        e.split(' ').forEach(e => { // this distinguishes rosa from subrosa
            if(e === spec) {
                match = true
            }
        })
    })
    return match;
}

let btBuildList = []
function cycleBackwards(from) { // from is initially species
    console.log(from)
    let q = 0
    coupletList.every(i => {
        if(i.references.includes(from)) {
            btBuildList.push(i)
            q = i.num
            if(from === 1) return;
        }
        return true
    })
    if(from != 0) { cycleBackwards(q) } else {
        /* problem here is do i want it descending or ascending? ascending makes it like a normal key but skipping;
        descending makes it clear that its a trace and it starts backwards. i kinda like descending but we'll see with use mb
        i would really like for this buildlist to contain the grandparent (containing species) couplet too for a clean reversal
        */
        btBuildList.forEach(r => id("subkeyarea").appendChild(createPairEntry(r)))
        return btBuildList
    }
}

let popbt = false // these guards are stupid. why are all of my functions running twice
function populateBacktrace() {
    if(popbt) return;
    popbt = true
    let subkey = key[globalGenus]
    // this crazy line gives a unique array of all species in the key
    let speclist = [...new Set(coupletList.filter(x => refMatches(x, "")).map(x => x = x.references).flat().filter(x => !(x>0)))]
    id("backtrace").removeChild(id("backtrace").children[0])
    let sel = document.createElement("select")
    sel.setAttribute("id", "bt-select")
    sel.appendChild(document.createElement("option")) // initial blank line
    speclist.forEach(e => {
        let c = document.createElement("option")
        c.setAttribute("value", e)
        c.innerText = e
        sel.appendChild(c)
    })
    backtrace.insertBefore(sel, id("subkeyarea"))
    sel.addEventListener("change", e => {
        e.preventDefault()
        id("subkeyarea").innerHTML = ""
        startBacktrace(sel.value)
    })
}

function startBacktrace(spec) {
    if(!spec) { return }
    let entrypoint = 0;
    btBuildList = [];
    coupletList.forEach(i => {
        if(refMatches(i, spec)) {
            id("subkeyarea").appendChild(createPairEntry(i))
            entrypoint = i
        }
    })
    // console.log(entrypoint)
    let trace = cycleBackwards(entrypoint.num)
}