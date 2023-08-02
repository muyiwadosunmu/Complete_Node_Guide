const pool = require("./db");

async function fetchData() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM your_table");
    client.release(); // Release the client back to the pool
    return result.rows;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

fetchData()
  .then((data) => console.log(data))
  .catch((err) => console.error("Error:", err.message));
