const path = require("path");

const express = require("express");

const app = express();
const PORT = 3000;

const adminRoutes = require("./routes/adminRoute");
const shopRoutes = require("./routes/shopRoute");
const errorController = require("./controllers/errorController");

// Template engine config
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

const pool = require("./util/DBConnect");

async function fetchData() {
  try {
    const client = await pool.connect();
    console.log("postgres DB Connected");
    const result = await client.query("SELECT * FROM products");
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

app.use(errorController.get404);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
