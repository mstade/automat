export default event

function event(defaultHandler = Function.prototype) {
  let handler = defaultHandler

  return {
    get: () => handler,
    set: (val = defaultHandler) => {
      handler = typeof val === 'function'? val : () => val
    }
  }
}