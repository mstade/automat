import event from './event'
import { parse, end } from './parse'
import { StateError } from './errors'

export { defineAutomat, defineAutomat as default }

Object.defineProperty(defineAutomat, 'end', { value: end })

function defineAutomat(start, spec) {
  const state = {}
  const stateEnter = {}
  const stateExit = {}
  const trace = Object.defineProperties({},
    { enter: event()
    , exit: event()
    }
  )

  Object.defineProperties(automat, {
    states: { enumerable: true, value: state },
    enter: { get: () => stateEnter, set: (fn) => trace.enter = fn },
    exit: { get: () => stateExit, set: (fn) => trace.exit = fn }
  })

  for (let [name, transitions] of Object.entries(spec)) {
    Object.defineProperty(state, name,
      { enumerable: true
      , value: parse(state, transitions)
      }
    )
    Object.defineProperty(stateEnter, name, event(x => x))
    Object.defineProperty(stateExit, name, event())
  }
  
  return automat

  async function automat(stream, context) {
    const tape = getIterator(stream)
    let prev, next = start

    while (true) {
      let input = await tape.next()
      const [ enter, current ] = [ stateEnter[next], next ]

      const cond = await enter(input.value, { state: current, prev, context })
      await trace.enter(input.value, { state: current, prev, context, cond })

      next = state[current][cond === undefined? '' : cond] || state[current]['']

      if (next === undefined) {
        throw new StateError(
          `Undefined transition: ${current}(${cond})`
        , { input, state: current, prev, cond, next, context }
        )
      }

      const exit = stateExit[current]
      await exit(input.value, { state: current, prev, cond, next, context })
      await trace.exit(input.value, { state: current, prev, cond, next, context })
      prev = current

      if (next === end) {
        return context
      } else if (input.done) {
        throw new StateError(
          `Expected '${next}' state but got end of input`
        , { input, state: current, prev, cond, next, context }
        )
      }
    }
  }
}


function getIterator(stream = []) {
  if (stream[Symbol.iterator]) {
    return stream[Symbol.iterator]()
  } else if (stream[Symbol.asyncIterator]) {
    stream[Symbol.asyncIterator]()
  } else if (isGenerator(stream)) {
    return stream()
  } else {
    return [][Symbol.iterator]()
  }
}

function isGenerator({ constructor } = {}) {
  return constructor.name === "GeneratorFunction"
}

function isPromise({ then } = {}) {
  return typeof then === 'function'
}