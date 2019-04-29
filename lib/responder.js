const { readFileSync } = require('fs')
const glob = require('glob')
const { lookup } = require('mime-types')

const { STATIC_EXTENSIONS } = require('../config/constants')

const STATIC_FILES = glob.sync(`./public/**/*.@(${STATIC_EXTENSIONS.join('|')})`).reduce((fileMap, filename) => {
  fileMap[filename.slice(8)] = readFileSync(filename)
  return fileMap
}, {})

const serveStaticFile = async ({ file, extension }, response) => {
  if (!STATIC_FILES.hasOwnProperty(file)) throw new Error('not_found')

  const mime = lookup(extension)
  if (!mime) throw new Error('not_found')

  response.writeHead(200, {
    'content-type': mime
  })

  return response.end(STATIC_FILES[file])
}

module.exports = serveStaticFile
