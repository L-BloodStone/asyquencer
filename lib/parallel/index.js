module.exports = class ParallelTask {
  #tasks = []
  #promises = []
  constructor (tasks) {
    if (tasks) {
      if ( !Array.isArray( tasks )) {
        throw new Error("Argument must be a Array of functions")
      }

      this.#checkTasksArr(tasks)    //checking if array contains all functions
      this.#tasks.push(...tasks)
    }
  }

  add (task) {
    //adding task to the array
    if ( Array.isArray(task) ) {
      this.#checkTasksArr(task)
      this.#tasks.push(...task)
      
    } else if ( typeof(task) === 'function' ) {
      this.#tasks.push(task)
      
    } else {
      throw new Error("Argument must be an array of functions or a single function")
    }

    return this
  }

  run (cb, option) {
    for (const item of this.#tasks) {
      //storing the functions as promises
      this.#promises.push(new Promise((res) => {
        res(item())
      }))
    }
    
    if (cb === "strict" || option === "strict") {
      return this.#strictRun(cb)
    }

    if (cb) {
      return Promise.allSettled(this.#promises).then(cb)    //return settled promises either fulfiled or rejected
    }
    
    return Promise.allSettled(this.#promises)
  }
  
  #strictRun (cb) {
    for (const item of this.#tasks) {
      this.#promises.push(new Promise((res) => {
        res(item())
      }))
    }
    if (typeof cb === "function") {
      return Promise.all(this.#promises).then(cb)   //return only if all promises are fulfiled
    }
    
    return Promise.all(this.#promises)
  }

  #checkTasksArr (array) {
    for (const item of array) {
      if (typeof(item) !== 'function') {
        throw new Error("All tasks must be functions")
      }
    }
  }
}
