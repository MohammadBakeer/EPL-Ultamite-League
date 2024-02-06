const { Pool } = require('pg');

const pool = new Pool({
  user: 'mohammadbakeer320', // Set this to your PostgreSQL username
  host: 'localhost',
  database: 'postgres',
  password: '1a2b3cMjB(())*',
  port: 5432,
});

module.exports = pool;


