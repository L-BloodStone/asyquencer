# asyquencer
**A small node.js library to run asynchronous functions and promises in serially or the parallel way.**

## Installation
Currently, this Node.js module is not available through npm registry. It can be installed with this github repository.

```console
$ npm install https://github.com/L-BloodStone/asyquencer
```

## Usage

### Serial Asynchronous Sequence
When it is required to execute one asynchronous function after another function serially, it is helpful to use the `serialAsyq`. The `serialAsyq` constructor accepts a single array of functions or it can be empty. 

To create a serial sequence -

```js
const { serialAsyq } = require("asyquencer")

const fetchURI = new serialAsyq([<function>, <function>])
// or
const fetchURI = new serialAsyq()
```

To add functions to the sequence use `add()` method.
     
```js
fetchURI.add( () => fetch('http://github.com') )
```

The `add()` method also accepts an array of functions.

```js
fetchURI.add([<function>, <function>])
```

