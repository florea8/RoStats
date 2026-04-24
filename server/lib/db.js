const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: true },
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

module.exports = {
  query: (text, params) => {
    const p = getPool();
    if (!p) throw new Error('DATABASE_URL is not configured');
    return p.query(text, params);
  },
};
