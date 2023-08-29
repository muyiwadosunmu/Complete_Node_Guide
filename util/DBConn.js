const Sequelize = require("sequelize");

const sequelize = new Sequelize("TutDB", "postgres", "postgres", {
  host: "localhost", // Replace with your PostgreSQL server's host
  port: 5432, // Replace with the port number PostgreSQL is running on
  dialect: "postgres",
  logging: false, // Set to true to see SQL queries in the console
});

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = sequelize;
