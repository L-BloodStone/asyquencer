
const serial = require("./lib/serial")


const fetchh = new serial()

fetchh.add(() => fetch("https://google.com").then( text => text))
fetchh.add(() => fetch("https://bing.com").then( text => text))
fetchh.add(() => fetch("https://github.com"))

fetchh.run((_, all) => console.log(all))
