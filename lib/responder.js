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

const serveRoute = async ({ method, path, context }, response) => {
  const key = `${method}:${path}`
  if (!routes[key]) throw new Error('not_found')

  Handlebars.registerPartial('content', routes[key].body)
  const hbs = Handlebars.compile(basePage)

  return response.end(hbs(context))
}

module.exports = { serveStaticFile, serveRoute }
