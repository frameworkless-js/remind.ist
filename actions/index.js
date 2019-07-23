// actions/index.js

const glob = require('glob')

module.exports = glob.sync(
  './actions/**/*.js',
  { ignore: [ './actions/index.js' ] }
).reduce((actions, filename) => {
  const pathTokens = filename.split('/')
  const key = pathTokens[pathTokens.length - 1].slice(0, -3)

  actions[key] = require(`.${filename}`)

  return actions
}, {})
