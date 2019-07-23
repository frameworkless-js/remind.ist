// app.js

const server = require('./initialisers/http')
const db = require('./initialisers/postgres')

const run = () => {
  server({ db })
}

run()
