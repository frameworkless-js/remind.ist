if (!process.env.PORT) require('dotenv').config()

const { createServer } = require('http')

const serveStaticFile = require('../lib/responder')
const errors = require('../config/errors')

const { PORT, APP_NAME } = process.env

module.exports = () => {
  const server = createServer(async ({ url }, response) => {
    const urlTokens = url.split('.')
    const extension = urlTokens.length > 1 ? `${urlTokens[urlTokens.length - 1].toLowerCase().trim()}` : false
    const isRoot = [ '', '/' ].indexOf(url) > -1
    const path = isRoot ? '/index.html' : url

    try {
      return await serveStaticFile({ file: path, extension: isRoot ? 'html' : extension }, response)
    } catch (error) {
      console.error(error)
      const errorData = errors(error)

      return await serveStaticFile({
        file: '/error.html',
        extension: 'html',
        statusCode: errorData.code
      }, response)
    }
  })

  server.on('error', error => {
    console.error(`=> Error encountered: ${error.message}}`)
    if (error.stack) console.error(error.stack)

    process.exit(1)
  })

  server.on('request', ({ method, url }) => {
    const now = new Date()
    console.info(`=> ${now.toUTCString()} – ${method} ${url}`)
  })

  server.listen(PORT, async () => {
    console.log(
      `=> ${APP_NAME} running on port ${PORT}`
    )
  })
}
