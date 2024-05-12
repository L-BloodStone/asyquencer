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

    this.currentIndex = 0
    this.lastValue
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

  remove(index) {
    if ( index <= this.currentIndex || (index > this.#tasks - 1) ) {
      throw new Error("Index value can't be less than current function index or more than the number of existing functions!")
    }
    // if index is provided, make that function an empty function
    if (index) {
      this.#tasks[index] = () => { return false }
    } else {
      this.#tasks[this.currentIndex + 1] = () => { return false }
    }
  }

  async run(cb) {
    for (let i = 0; i < this.#tasks.length; i++) {
      // setting currentIndex to the current running function
      this.currentIndex = i
      
      try {
        // assigning the return value of function to lastValue
        this.lastValue = await this.#tasks[i].bind(this)(this.lastValue) 
        if (this.lastValue === undefined) this.lastValue = false    //if lastValue is undefined assign it to false
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
