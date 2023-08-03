const Pool = require("pg-pool");

const pool = new Pool({
  database: "node-complete-guide",
  user: "postgres",
  password: "postgres",
  port: 5432,
  max: 10,
});

module.exports = pool;
