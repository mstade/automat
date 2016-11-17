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

console.log()
console.log(fsm)

;['cadr', 'cada', 'cadar', 'cadrr'].reduce(async (last, input) => {
  await last

  let path = []

  fsm.every.enter = (char, _, { state }) => {
    path.push(`=> ${state} (${char})`)
  }

  fsm.end = (_, { state }) => {
    path.push(`|> ${String(state)}`)
  }

  try {
    let result = await fsm(input)
    console.log(path.join(' '), `= ${result}`)
  } catch (e) {
    console.log(path.join(' '), `x> ${e}`)
  }
}, {})