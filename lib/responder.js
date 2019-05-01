const { readFileSync, promises: { open } } = require('fs')
const { lookup } = require('mime-types')
const Handlebars = require('handlebars')

const { STATIC_EXTENSIONS } = require('../config/constants')

const routes = require('../routes')
const basePage = readFileSync(`./templates/template.hbs`, { encoding: 'utf8' })

const serveStaticFile = async ({ path, extension, statusCode }, response) => {
  if (STATIC_EXTENSIONS.indexOf(extension) === -1) throw new Error('not_found')

  let fileHandle

  try {
    fileHandle = await open(`./public/${path}`, 'r')
    const staticFile = await fileHandle.readFile()

    const mime = lookup(extension)
    if (!mime) throw new Error('not_found')

    response.writeHead(statusCode || 200, {
      'Content-Type': mime
    })

    return response.end(staticFile)
  } catch (error) {
    console.error(error)
    throw new Error('not_found')
  } finally {
    if (fileHandle) fileHandle.close()
  }
}

const serveRoute = async ({ request, context }, response) => {
  const key = `${request.method}:${request.url}`
  const route = routes[key]

  if (!route) throw new Error('not_found')

  Handlebars.registerPartial('content', route.body)
  const hbs = Handlebars.compile(basePage)

  let routeContext = {}
  if (route.data) routeContext = await route.data(request)

  return response.end(hbs({ ...context, ...routeContext }))
}

module.exports = { serveStaticFile, serveRoute }
