if (!process.env.PORT) require('dotenv').config()

const { createServer } = require('http')

const { serveStaticFile, serveRoute } = require('../lib/responder')
const errors = require('../config/errors')

const { PORT, APP_NAME } = process.env

module.exports = ({ db }) => {
  const server = createServer(async (request, response) => {
    const requestStart = Date.now()

    const urlTokens = request.url.split('.')
    const extension = urlTokens.length > 1 ? urlTokens[urlTokens.length - 1].toLowerCase().trim() : false
    const serveResponse = extension ? serveStaticFile : serveRoute
    const responseParams = { path: request.url }

    if (extension) {
      responseParams.extension = extension
    } else {
      responseParams.request = request
      responseParams.context = {
        app_name: APP_NAME
      }
      responseParams.db = db
    }

    try {
      return await serveResponse(responseParams, response)
    } catch (error) {
      console.error(error)
      const errorData = errors(error)

      return await serveStaticFile({
        path: '/error.html',
        extension: 'html',
        statusCode: errorData.code
      }, response)
    } finally {
      if (extension) return

      const ms = Date.now() - requestStart
      const ua = request.headers['user-agent']
      const { statusCode } = response

      console.info(
        `[${new Date().toUTCString()}] – ${statusCode} ${request.method} ${request.url} (${ms}ms) {${ua}}`
      )
    }
  })

  server.on('error', error => {
    console.error(`=> Error encountered: ${error.message}}`)
    if (error.stack) console.error(error.stack)

    process.exit(1)
  })

  server.listen(PORT, async () => {
    console.log(
      `=> ${APP_NAME} running on port ${PORT}`
    )
  })
}
