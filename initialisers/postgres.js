// initialisers/postgres.js

const { Pool } = require('pg')

const { DATABASE_URL } = process.env

if (!DATABASE_URL) throw new Error('DATABASE_URL not set!')

module.exports = new Pool({ connectionString: DATABASE_URL })
