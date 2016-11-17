export default class AutomatError extends Error {
  constructor(message, { stream, input, state, prev, cond, next, context, cause }) {
    super(message)

    Object.defineProperty(this, 'name', { value: AutomatError.name })
    set(this, { stream, input, state, prev, cond, next, context, cause })
  }
}

function set(host, props) {
  for (let [k, v] of Object.entries(props)) {
    if (v !== undefined) {
      host[k] = v
    }
  }
}