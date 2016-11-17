import event from './event'

export const end = Symbol('automat end')

export function build(spec) {
  const state = {}
  const enter = {}
  const exit = {}

  for (let [name, transitions] of Object.entries(spec)) {
    Object.defineProperty(state, name,
      { enumerable: true
      , value: parse(name, transitions)
      }
    )
    Object.defineProperty(enter, name, event(x => x))
    Object.defineProperty(exit, name, event())
  }

  return {
    state: { enumerable: true, value: state },
    start: event(),
    every: { value: Object.defineProperties({},
      { enter: event()
      , exit: event()
      }
    ) },
    enter:
      { get: () => enter
      , set: events => {
          for (let [event, handler] of Object.entries(events)) {
            enter[event] = handler
          }
        }
      },
    exit:
      { get: () => exit
      , set: events => {
          for (let [event, handler] of Object.entries(events)) {
            exit[event] = handler
          }
        }
      },
    end: event()
  }
}

export function parse(state, transitions) {
  if (transitions === end) {
    return end
  }

  let source = {}

  for (let transition of [].concat(transitions)) {
    let target = transition, conditions = ['']

    if (typeof transition === 'function') {
      target = transition()
      conditions = parseConditions(transition)
    }

    if (target === end || target === undefined) {
      target = end
    } else {
      target = String(target)
    }

    for (let cond of conditions) {
      if (cond in source) {
        throw new SyntaxError(`${state}(${cond}) already defined`)
      }

      source[cond] = target

      Object.defineProperty(source, cond,
        { enumerable: true
        , value: target
        }
      )
    }
  }

  return source
}

const fn = /^function\s*(?:[^(]+)?\(([^)]*)\)/
const parens = /^\s*\(\s*([^)]*?)\s*\)\s*=>/
const single = /^([^()]*?)=>/

function parseConditions(transition) {
  let src = transition.toString()
  let [ match
      , signature = ''
      ] = single.exec(src) || parens.exec(src) || fn.exec(src)

  return signature.trim().split(/\s*,\s*/gi)
}