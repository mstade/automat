import Automat from '../automat'

const fsm = Automat('init',
  { init: c => 'more'
  , more:
    [ a => 'more'
    , d => 'more'
    , r => 'end'
    ]
  , end: Automat.end
  }
)

console.log(fsm)

fsm.enter = (input, { context, state, cond }) => {
  console.log(`${context} => ${state}(${input === undefined? '' : input})`)

  if (input !== cond) {
    console.log(`\t${cond}`)
  }
}

fsm.exit = (_, { context, state, next }) => {
  console.log(`${context} <= ${state}`)
}

Promise.all(
    ['car', 'cdr', 'cadr', 'cddr', 'cddar', 'crad']
      .map((stream, i) => {
        console.log('start:', i)
        return fsm(stream, i)
      })
  )
  .then(r => console.log('done:', r))
  .catch(e => console.log('error:', e))