export { parse, parse as default }
export const end = Symbol('automat end')

function parse(state, transitions) {
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