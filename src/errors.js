export class StateError extends Error {
  constructor(message, { input, state, prev, cond, next, context }) {
    super(message)
    this.name = 'StateError'
    this.input = input
    this.state = state
    this.prev = prev
    this.cond = cond
    this.next = next
    this.context = context
  }
}