module.exports = class serialAsyq {
  #tasks = []   //private field to store functions
  
  constructor (tasks) {
    //if tasks array is provided then do some checkings
    if (tasks) {
      if (!Array.isArray(tasks)) {
        throw new Error("Must be an Array")
      }
    
      this.#checkTasksArr(tasks)    //checking if all the tasks are functions
      this.#tasks.push(...tasks)
    }

    this.lastValue;
    this.values = []
  }

  add (task) {
    if (Array.isArray(task)) {
      this.#checkTasksArr(task)
      this.#tasks.push(...task)
    } else if ( typeof(task) === 'function' ) {
      this.#tasks.push(task)
    } else { throw new Error ('Argument must either a function or an array of functions!')}

    return true
  }

  remove() {
    return this.#tasks.pop()
  }

  removeLast() {
    return this.#tasks.pop()
  }

  removeFirst() {
    return this.#tasks.shift()
  }

  async run(cb) {
    for (const task of this.#tasks) {
      
      try {
        // assigning the return value of function to lastValue
        this.lastValue = await task(this.lastValue ?? false)    //if lastValue is undefined pass false
        
        // if any function return "break" string, this will stop the execution
        if (this.lastValue === "break") {
          this.values.pop()
          this.lastValue = this.values.at(-1)
          break
        }
        
      } catch (err) {
        if (err) throw new Error (err)
      }
      
      this.values.push(this.lastValue)
    }

    if (cb) {
      return await cb(this.lastValue, this.values)
    }

    async function then(cb) {
      return await cb(this.lastValue, this.values)
    }
    //returns an object with then method, inspired by Promise
    //also lastValue & values to maintain new return object scope
    return { lastValue: this.lastValue, values: this.values, then}
  }
  
  #checkTasksArr = (array) => {
    for (const item of array) {
      if (typeof(item) !== 'function') {
        throw new Error("All tasks must be functions")
      }
    }
  }
}
