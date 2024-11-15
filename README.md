# asyquencer
**A small node.js library to run asynchronous functions and promises serially or in parallel.**

## Contents
* [Serial Asynchronous Sequence](#Serial-Asynchronous-Sequence)

## Installation
Currently, this Node.js module is not available through the NPM registry. It can be installed with this GitHub repository.

```console
$ npm install https://github.com/L-BloodStone/asyquencer
```

## Usage

### Serial Asynchronous Sequence
#### `SerialTask()`

When it is required to execute multiple functions serially and get the return value of one asynchronous function before the next function starts executing, it is helpful to use the 'SerialTask`. The `SerialTask` constructor accepts a single array of functions, or it can be empty. 

To create a serial sequence -
```js
const { SerialTask } = require("asyquencer")

// const fetchURI = new SerialTask([<function>, <function>, ...])
// or
const fetchURI = new SerialTask()
```

#### `.add(cb)`
To add functions to the sequence, use the `add()` method. Adding a function only adds the function to the sequence.
It doesn't execute anything. The `add()` method will return `true` if it adds a function successfully. 
     
```js
fetchURI.add(() => {
    fetch('http://github.com').then(response => console.log(response))
})
```

The `add()` method also accepts an array of functions. And it is also possible to chain methods.

```js
fetchURI.add(() => "function")
    .add(() => "another function")
```

```
fetchURI.add([<function>, <function>, ...])
```

#### Breaking a sequence by returning a `'break'` string.

```js
const { SerialTask } = require('asyquencer')

const dummy = new SerialTask()

dummy.add(() => 1)
dummy.add(() => 2)
dummy.add(() => "break")
dummy.add(() => 3)      //will not run
```
This will break the sequence and will not execute the next function.

#### `.run(cb)`
To run all provided functions sequentially, use the `run()` method. It will execute the functions sequentially in the order they were defined.

```js
fetchURI.run()
```

The return value of each function of the sequence will be passed to the next function of the sequence.
The initial function will receive a `false` boolean value.
If any function does not return anything, next function will receive `false`. 
** A common mistate is made when writing array functions with curly braces. **
```js
const { SerialTask } = require('asyquencer')

const fetchURI = new SerialTask()

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

When a sequence is broken by returning a `'break'` string, the `run()` method returns `lastValue` and `allValues` until the `break` function. The 'run()' method is an asynchronous function; to get the return value, it must be used inside an async function.
Breaking a sequence can be useful when it is used with a conditional statement.

```js
const { SerialTask } = require('asyquencer')

const dummy = new SerialTask()

dummy.add(() => 1)
dummy.add(() => 2)
dummy.add((num) => num === 0 ? true : "break")
dummy.add(() => 3)      //will not run

dummy.run()     // returns { `lastValue` 2, `allValues` [1, 2], next() }
```
Sometimes it is needed to execute a specific task after the sequence has been finished. This can be achieved by calling the `run()` method with a function as an argument.This callback function will execute after all functions in the sequence have finished executing. Two arguments will be passed to that callback. The first argument is `lastValue`, the return value of the last function of the sequence; the second is `allValues`, an array of all the values returned by each function of the sequence.

```js
async function coolStuff() {
    const data = await fetchURI.run((_, allValues) => allValues)
}
```

The `run()` method returns an object with three property `{ lastValue, allValues, next }`.

```js
async function coolStuff() {
    const data = await fetchURI.run()
    console.log(data.allValue)
}
```
