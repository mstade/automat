import { build, end } from './spec'
import AutomatError from './errors'

export { defineAutomat, defineAutomat as default }

Object.defineProperty(defineAutomat, 'end', { value: end })

function defineAutomat(start, spec) {
  const
    { state
    , every
    , enter
    , exit
    } = Object.defineProperties(automat, build(spec))

  let isRunning = false
  Object.defineProperty(automat, 'isRunning',
    { get: () => isRunning
    , enumerable: true
    }
  )
  
  return automat

  async function automat(stream, context = stream) {
    isRunning = true

    const tape = getIterator(stream)
    let input = await tape.next()
    let curr, prev, cond, next = start

    automat.start(input.value, context, { state: next })
    while (isRunning) {
      let enterState = enter[next]
      let transition = state[next]
      curr = next
      next = undefined

      if (input.done && input.value === undefined) {
        isRunning = false
        throw new AutomatError(
          `Unexpected end of input, wanted: ${
            Object.keys(transition).join(', ')
          }`
        , { stream, input, state: curr, prev, cond, next, context }
        )
      }

      every.enter(input.value, context, { state: curr, prev })
      cond = await enterState(input.value, context, { state: curr, prev })

      if (cond === undefined) {
        cond = any
      }

      if (transition[cond]) {
        next = transition[cond]
      } else if (transition[any]) {
        next = transition[any]
        cond = any
      } else {
        isRunning = false
        throw new AutomatError(
          `Undefined condition: ${curr}(${cond})`
        , { stream, input, state: curr, prev, cond, next, context }
        )
      }

      isRunning = (next !== end && state[next] !== end)

      exit[curr](input.value, context, { state: curr, prev, cond, next })
      every.exit(input.value, context, { state: curr, prev, cond, next })

      input = await tape.next()
      prev = curr
    }

    if (!input.done) {
      throw new AutomatError(
        `Unexpected end of machine; input isn't done`
      , { stream, input, state: curr, prev, cond, next, context }
      )
    }

    return automat.end(context, { state: next, prev, cond }), context
  }
}

const any = ''

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

function val(x, otherwise) {
  if (typeof x === 'function') {
    return x()
  } else if (x === undefined) {
    return otherwise
  } else {
    return val
  }
}

function isUndef(x) {
  return x === undefined
}