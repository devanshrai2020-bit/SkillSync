const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "skillsync",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: true }
});

async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = { query, pool };
