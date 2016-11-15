import { http, protocol } from './http-machine'

function * request(method, target) {
  const req = Object.defineProperties({},
    { method : { value: method  , enumerable: true }
    , target : { value: target  , enumerable: true }
    , header : { value: {}      , enumerable: true }
    , body   : { writable: true , enumerable: true }
    , toString: { value: () => `${method} ${target}` }
    }
  )

  while (true) yield req
}

protocol.enter = (req, { state, cond }) => {
  console.log(`=> ${state} (${req})`)

  if (req !== cond) {
    console.log(`\t${cond}`)
  }
}

protocol.exit = (_, { state, next }) => {
  console.log(`<= ${state}`)
}

protocol.enter.is_service_available = _ => {
  return Math.random() < 0.8? 'yes' : 'no'
}

console.log()
console.log(protocol)

timed(http(request('GET', '/foo'))).then(({ result, duration }) => {
  console.log(`response time: ${duration.ms}ms`)
  console.log(`response: ${result.res.code} ${result.res.message}\n`)
})

async function timed(proc) {
  const start = process.hrtime()
  const result = await proc
  const duration = process.hrtime(start)

  duration.ns = duration[0] * 1e9 + duration[1]
  duration.ms = duration.ns / 1e6
  duration.s  = duration.ns / 1e9

  return { result, duration }
}