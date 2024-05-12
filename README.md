# asyquencer
**A small node.js library to run asynchronous functions and promises in serially or the parallel way.**

## Contents
* [Serial Asynchronous Sequence](#Serial-Asynchronous-Sequence)

## Installation
Currently, this Node.js module is not available through npm registry. It can be installed with this github repository.

```console
$ npm install https://github.com/L-BloodStone/asyquencer
```

## Usage

### Serial Asynchronous Sequence
#### `serialAsyq()`

When it is required to execute multiple function serially and get the return value of one asynchronous function before the next function start executing, it is helpful to use the `serialAsyq`. The `serialAsyq` constructor accepts a single array of functions or it can be empty. 

To create a serial sequence -

```js
const { serialAsyq } = require("asyquencer")

// const fetchURI = new serialAsyq([<function>, <function>, ...])
// or
const fetchURI = new serialAsyq()
```

#### `.add()`
To add functions to the sequence use `add()` method. Adding a function only adds the function to the sequence.
It doesn't execute anything. The `add()` method will return `true` if it adds a function successfully. 
     
```js
fetchURI.add(() => {
    fetch('http://github.com').then(response => console.log(response))
})
```

The `add()` method also accepts an array of functions.

```
fetchURI.add([<function>, <function>, ...])
```

#### Breaking a sequence by returning `'break'` string.

```js
const { serialAsyq } = require('./')

const dummy = new serialAsyq()

dummy.add(() => 1)
dummy.add(() => 2)
dummy.add(() => "break")
dummy.add(() => 3)      //will not run
```
This will break the sequence and will not execute the next function.

#### `.run()`
To run all provided function sequencially use `run()` method. It will execute the functions sequencially in the order it was defined.

```js
fetchURI.run()
```

The return value of each function of the sequence will be passed to the next function of the sequence.
Initial function will receive `false` boolean value.
If any function does not return anything, next function will recieve `false`. 
** A common mistate is made when writing array functions with curly braces. **

```js
const { serialAsyq } = require('asyquencer')

const fetchURI = new serialAsyq()

fetchURI.add(() => {
    return fetch('http://github.com').then((response) => response.text())
    // returns a promise which will be resolved
    // and the result will be passed to the next function.
})

fetchURI.add((text) => {
    // `text` is the return value of previous function.
    console.log(text)
})

fetchURI.add((value) => {
    console.log(value)      // This will log false,
                            //cause previous function didn't return.
})

fetchURI.run()
```

#### `.run.then()`

Sometimes it is needed to execute specific task after the sequence has been finished.
This can be achived by calling the `run().then()` method.
`then()` method will execute after the all functions of the sequence.
The `then()` method accepts a callback function and two arguments will be passed to that callback.
The first argument is `lastValue` the return value of the last function of the sequence,
second one is `allValues` an array of all the values return by each function of the sequence.

```js
fetchURI.run().then((lastValue, allValues) => {
    // Do something cool
})
```

The `run().then()` method also returns the value of the callback function.

```js
async function coolStuff() {
    // `data` holds the return value of the cb inside `.then()`.
    const data = await fetchURI.run().then((_, allValues) => allValues)
    
    //do some coolStuff with data
}
```

There is a shortcut available for the `then()` method. It is possible to pass the callback directly inside `run()` method.
Next example is equivalent to the previous one. And it will also return the value of the callback function.

```js
async function coolStuff() {
    const data = await fetchURI.run((_, allValues) => allValues)
}
```
