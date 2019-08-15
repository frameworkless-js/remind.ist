const { readFileSync, promises: { open } } = require('fs')
const { lookup } = require('mime-types')
const Handlebars = require('handlebars')

const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const cssImports = require('postcss-import')
const sass = require('postcss-node-sass')
const cssUrl = require('postcss-url')
const browserify = require('browserify')

const { NODE_ENV, CACHE_MAX_AGE } = process.env
const { STATIC_EXTENSIONS } = require('../config/constants')

const hbsHelpers = require('./handlebar-helpers')
for (const helper of Object.keys(hbsHelpers)) Handlebars.registerHelper(helper, hbsHelpers[helper])

const routes = require('../routes')
const basePage = readFileSync(`./templates/template.hbs`, { encoding: 'utf8' })

const serveAssetFromPipeline = async ({ file, extension, path }, response) => {
  if (extension === 'css') {
    const { css } = await postcss()
      .use(sass)
      .use(cssImports())
      .use(cssUrl({ url: 'inline' }))
      .use(autoprefixer)
      .process(file, { from: path, include: [ './node_modules' ] })

    return response.end(css)
  } else if (extension === 'js') {
    return browserify(path)
      .transform('babelify', { presets: [ '@babel/preset-env' ] })
      .bundle().pipe(response)
  }
}

const serveStaticFile = async ({ path, extension, statusCode }, response) => {
  if (STATIC_EXTENSIONS.indexOf(extension) === -1) throw new Error('not_found')

  let fileHandle

  try {
    const pipelineAsset = NODE_ENV !== 'production' && [ 'css', 'js' ].indexOf(extension) > -1
    const realPath = pipelineAsset ? `./assets/${extension}${path}` : `./public/${path}`

    fileHandle = await open(realPath, 'r')
    const staticFile = await fileHandle.readFile()

    const mime = lookup(extension)
    if (!mime) throw new Error('not_found')

    response.writeHead(statusCode || 200, {
      'Content-Type': mime,
      'Cache-Control': `max-age=${CACHE_MAX_AGE || 604800}`
    })

    if (pipelineAsset) return serveAssetFromPipeline({ file: staticFile, extension, path: realPath }, response)

    return response.end(staticFile)
  } catch (error) {
    console.error(error)
    throw new Error('not_found')
  } finally {
    if (fileHandle) fileHandle.close()
  }
}

const serveRoute = async ({ request, context, db }, response) => {
  const key = `${request.method}:${request.url}`
  const route = routes[key]

  if (!route) throw new Error('not_found')

  Handlebars.registerPartial('content', route.body)
  const hbs = Handlebars.compile(basePage)

  let routeContext = {}
  if (route.data) routeContext = await route.data({ request, db })

  return response.end(hbs({ ...context, ...routeContext }))
}

module.exports = { serveStaticFile, serveRoute }
