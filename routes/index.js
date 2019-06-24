const { readFileSync } = require('fs')
const glob = require('glob')

module.exports = glob.sync(
  './routes/**/*.js',
  { ignore: [ './routes/index.js' ] }
).reduce((routeMap, filename) => {
  const route = require(`.${filename}`)

  if (route.template) {
    route.body = readFileSync(`./templates/${route.template}.hbs`, { encoding: 'utf8' })
  }

  routeMap[`${route.method || 'GET'}:${route.uri}`] = route

  return routeMap
}, {})
