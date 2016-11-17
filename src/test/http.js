import { createResource, createWeb } from './http-machine'

const web = createWeb()

const resource = createResource()

web.register('/foo', resource)

console.log()

timed(() => {
  let indent = ''

  resource.start = (req, res) => {
    res.log = []
    res.start = process.hrtime()
    let method = req.method.slice(0, 3)
    res.log.push(`───────▸ ${method}╶╮`)
  }

  resource.every.exit = (req, res, { state, cond, next }) => {
    let indent = '             ├'
    res.log.push(`${indent} ${state}${cond && ':'} ${cond}`)
  }

  resource.end = (res) => {
    const time = process.hrtime(res.start)
    time.ns = time[0] * 1e9 + time[1]
    time.us = time.ns / 1e3
    time.ms = time.ns / 1e6
    time.s  = time.ns / 1e9

    const code = res.status? res.status[0] : 200

    res.log.forEach(entry => {
      console.log(entry)
    })
    console.log(`◂─╴${time.ms.toFixed(1)}ms ${code}╶╯`)
  }
  
  return web.request('GET', '/foo')
}).then(({ result, duration }) => {
  console.log(`response time: ${duration.ms}ms`)
}, console.error.bind(console))

async function timed(proc) {
  const start = process.hrtime()
  const result = await (typeof proc === 'function'? proc() : proc)
  const duration = process.hrtime(start)

  duration.ns = duration[0] * 1e9 + duration[1]
  duration.ms = duration.ns / 1e6
  duration.s  = duration.ns / 1e9

  return { result, duration }
}