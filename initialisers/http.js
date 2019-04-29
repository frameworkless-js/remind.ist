if (!process.env.PORT) require('dotenv').config()

const { createServer } = require('http')

const serveStaticFile = require('../lib/responder')

const { PORT, APP_NAME } = process.env

module.exports = () => {
  const server = createServer(async ({ url }, response) => {
    const urlTokens = url.split('.')
    const extension = urlTokens.length > 1 ? `.${urlTokens[urlTokens.length - 1].toLowerCase().trim()}` : false

    return await serveStaticFile({ file: url, extension }, response)
  })

  server.on('error', error => {
    console.error(`=> Error encountered: ${error.message}}`)
    if (error.stack) console.error(error.stack)

    process.exit(1)
  })

  server.on('request', ({ method, url }) => {
    const now = new Date()
    console.info(`=> ${now.toUTCString()} – ${method} ${url}}`)
  })

  server.listen(PORT, async () => {
    console.log(
      `=> ${APP_NAME} running on port ${PORT}`
    )
  })
}
