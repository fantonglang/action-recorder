import BasicController from "./BasicController.js"

export const filters = []

async function filter_context(request, response, next) {
  const {message: {type, data}, sender} = request
  const _req = {type, sender, data}
  if (!type) {
    response({type: "ERROR", message: "type field empty"})
    return
  }
  try {
    await next(_req, response)
  } catch (err) {
    console.error(err)
    response({type: "ERROR", message: err.toString()})
  }
}

async function filter_load(request, response) {
  const {type, sender, data} = request
  const c = new BasicController()
  c.setContext(request, response)
  const names = Object.getOwnPropertyNames(c.__proto__)
  const name = names.find(p => p.toLowerCase() == type.toLowerCase())
  if (!name) {
    console.log('type', type)
    console.log('names', names)
    response({type: "ERROR", message: "METHOD_NOT_FOUND"})
    return
  }
  const result = await c[name].apply(c, [data])
  if (result) {
    c.reply(result)
  }
}

filters.push(filter_context, filter_load)

export default function loadPipeline() {
  return async function(request, response) {
    return await dispatch(0, request, response)
  }
  async function dispatch(i, request, response) {
    const hasNext = i < filters.length - 1
    const fn = filters[i]
    if (hasNext) {
      await fn(request, response, async function(request, response) {
        await dispatch(i+1, request, response)
      })
    } else {
      await fn(request, response)
    }
  }
}