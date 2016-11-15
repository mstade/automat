export default event

function event(defaultHandler = Function.prototype) {
  let handler = defaultHandler

  return {
    get: () => handler,
    set: (fn = defaultHandler) => {
      if (typeof fn !== 'function') {
        throw new TypeError('Event handler must be a function')
      }

      handler = fn
    }
  }
}