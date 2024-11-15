module.exports = class SerialTask {
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

    this.currentIndex = 0
    this.nextIndex = this.currentIndex + 1
    this.lastValue
    this.allValues = []
    
  }

  add (task) {
    if (Array.isArray(task)) {
      this.#checkTasksArr(task)
      this.#tasks.push(...task)
    } else if ( typeof(task) === 'function' ) {
      this.#tasks.push(task)
    } else { throw new Error ('Argument must either a function or an array of functions!')}

    return this
  }


  async run(cb) {
    for (let i = 0; i < this.#tasks.length; i++) {
      // setting currentIndex to the current running function
      // it also clears the index tracking of added functions
      this.currentIndex = i
      this.nextIndex = this.currentIndex + 1
      
      try {
        // assigning the return value of function to lastValue
        this.lastValue = await this.#tasks[i].bind(this.#tasks)(this.lastValue) 
        if (this.lastValue === undefined) this.lastValue = false    //if lastValue is undefined assign it to false
        // if any function return "break" string, this will stop the execution
        if (this.lastValue === "break") {
          this.allValues.pop()
          this.lastValue = this.allValues.at(-1)
          break
        }
        
      } catch (err) {
        if (err) throw new Error (err)
      }
      
      this.allValues.push(this.lastValue)
    }

    if (cb) {
      return await cb(this.lastValue, this.allValues)
    }

    async function next(cb) {
      const result = await cb(this.lastValue, this.allValues)
      return result
    }
    // console.log(this.lastValue, this.allValues)
    //returns an object with then method, inspired by Promise
    //also lastValue & allValues to maintain new return object scope
    return { lastValue: this.lastValue, allValues: this.allValues, next}
  }
  
  #checkTasksArr(array) {
    for (const item of array) {
      if (typeof(item) !== 'function') {
        throw new Error("All tasks must be functions")
      }
    }
  }

}
