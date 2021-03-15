class Stack {
  arr = []
  index = 0
  push(item) {
    this.arr.push(item)
    this.index++
  }
  pop() {
    this.index--
    return this.arr.pop()
  }
  getPeek() {
    return this.arr[this.index]
  }
  isAmpty() {
    return this.index === 0
  }
  size() {
    return this.index
  }
  reset() {
    this.arr = []
    this.index = 0
  }
  print() {}
}
