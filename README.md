# asyquencer
**A small node.js library to run asynchronous functions and promises in serially or the parallel way.**

## Installation
Currently, this Node.js module is not available through npm registry. It can be installed with this github repository.

```console
$ npm install https://github.com/L-BloodStone/asyquencer
```

## Usage

### Serial Asynchronous Sequence
When it is required to get the return value of one asynchronous function before the next function start executing, it is helpful to use the `serialAsyq`. The `serialAsyq` constructor accepts a single array of functions or it can be empty. 

To create a serial sequence -

```js
const { serialAsyq } = require("asyquencer")

// const fetchURI = new serialAsyq([<function>, <function>])
// or
const fetchURI = new serialAsyq()
```

To add functions to the sequence use `add()` method.
     
```js
fetchURI.add(() => {
    fetch('http://github.com').then(response => console.log(response))
})
```

The `add()` method also accepts an array of functions.

```
fetchURI.add([<function>, <function>])
```

To run all provided function sequencially use `run()` method.

```js
fetchURI.run()
```

The return value of each function of the sequence will be passed to the next function of the sequence.
Initial function will receive `false` boolean value.
If any function does not return anything, next function will recieve `false`. 
*** A common mistate is made when writing array functions with curly braces. ***

```js
const { serialAsyq } = require('asyquencer')

const fetchURI = new serialAsyq()

fetchURI.add(() => {
    return fetch('http://github.com').then((response) => response.text())
})

fetchURI.add((text) => {
    console.log(text)
})       // This function doesn't return anything

fetchURI.add((value) => {
    console.log(value)      // This will log out false
})

fetchURI.run()
```

Sometimes it is needed to execute specific task after the sequence has been finished.
This can be achived by calling the `run().then()` method.
The `then()` method accepts a callback function and two arguments will be passed to than callback.
The first argument is the return value of the last function of the sequence,
second one is an array of all the value return by each function of the sequence.

```js
fetchURI.run().then((lastValue, allValues) => {
    // Do something cool with this
})
```
The `run().then()` method also returns the value of the callback function -
```js
async function coolStuff() {
    const data = fetchURI.run().then((_, allValues) => allValues)
    //do some coolStuff with data
}
```
