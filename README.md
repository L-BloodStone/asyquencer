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
#### `serialAsyq()`

When it is required to execute multiple functions serially and get the return value of one asynchronous function before the next function starts executing, it is helpful to use the 'serialAsyq`. The `serialAsyq` constructor accepts a single array of functions, or it can be empty. 

To create a serial sequence -
```js
const { serialAsyq } = require("asyquencer")

// const fetchURI = new serialAsyq([<function>, <function>, ...])
// or
const fetchURI = new serialAsyq()
```

#### `.add(cb)`
To add functions to the sequence, use the `add()` method. Adding a function only adds the function to the sequence.
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

#### Breaking a sequence by returning a `'break'` string.

```js
const { serialAsyq } = require('asyquencer')

const dummy = new serialAsyq()

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

When a sequence is broken by returning a `'break'` string, the `run()` method returns `lastValue` and `allValues` until the `break` function. The 'run()' method is an asynchronous function; to get the return value, it must be used inside an async function.
Breaking a sequence can be useful when it is used with a conditional statement.

```js
const { serialAsyq } = require('asyquencer')

const dummy = new serialAsyq()

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

The `run()` method actually returns an object with three property `{ lastValue, allValue, next }`.

```js
async function coolStuff() {
    const data = await fetchURI.run()
    console.log(data.allValue)
}
```


#### `this.removeNext([index[, cb]])`

`removeNext()` method is useful when it is needed to remove a function at runtime or to change the function.
But the traditional `function` must be used to use this method. 
If no argument is passed to the method, the next function of the sequence will be cleared with an empty function that returns `false`.

```js
const a = require('asyquencer')

const dummy = new a.serialAsyq()

dummy.add(() => 0)
dummy.add(() => 1)
dummy.add(() => 2)
dummy.add(function() {
    this.removeNext() 
    return 3
})
dummy.add(() => 4)    // this function will be removed.
dummy.add(() => 5)

dummy.run((_, allValues) => console.log(allValues))     // `[ 0, 1, 2, 3, false, 5 ]`
```

`removeNext()` accepts two optional arguments. First is the `index` of the function to be removed, and second is a `callback`
function, if some change to that function is required. Changing the next function requires passing `false` to the first argument.

```js
const a = require('asyquencer')

const dummy = new a.serialAsyq()

dummy.add(() => 0)
dummy.add(() => 1)
dummy.add(() => 2)
dummy.add(function(lastValue) {
    if (lastValue === 2) this.removeNext( false, () => 404 ) 
    return 3
})
dummy.add(() => 4)    // this function will be changed.
dummy.add(() => 5)

dummy.run((_, allValues) => console.log(allValues))     // `[ 0, 1, 2, 3, 404, 5 ]`
```

Any other index can be accessed by passing an integer to the `index` argument.

```js
dummy.add(function(lastValue) {
    if (lastValue === 2) this.removeNext( 4, () => 404 ) 
    return 3
})
dummy.run((_, allValues) => console.log(allValues))     // `[ 0, 1, 2, 3, 4, 404 ]`
```
