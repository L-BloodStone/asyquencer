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

    this.currentValue;
    this.values = []
  }

  add (task) {
    if (Array.isArray(task)) {
      this.#checkTasksArr(task)
      this.#tasks.push(...task)
    } else if ( typeof(task) === 'function' ) {
      this.#tasks.push(task)
    } else { throw new Error ('Argument must either a function or an array of functions!')}
  }

  remove() {
    return this.#tasks.pop()
  }

  removeLast() {
    return this.#tasks.pop()
  }

  removeFirst() {
    return this.#tasks.unshift()
  }

  async run(cb) {
    for (const task of this.#tasks) {
      
      try {
        this.currentValue = await task(this.currentValue ?? false)    //if currentValue is undefined pass true
        
      } catch (err) {
        if (err) throw new Error (err)
      }
      
      this.values.push(this.currentValue)
    }

    if (cb) {
      return await cb(this.currentValue, this.values)
    }

    async function then(cb) {
      return await cb(this.currentValue, this.values)
    }
    //returns an object with then method, inspired by Promise
    //also currentValue & values to maintain new return object scope
    return { currentValue: this.currentValue, values: this.values, then}
  }
  
  #checkTasksArr = (array) => {
    for (const item of array) {
      if (typeof(item) !== 'function') {
        throw new Error("All tasks must be functions")
      }
    }
  }
}
