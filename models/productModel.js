const fs = require("fs");
const path = require("path");
const products = [];
const db = require("../util/DBConn");

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {}

  static deleteById(id) {}

  static async fetchAll() {
    try {
      const client = await db.connect();
      const result = await client.query("SELECT * FROM products");
      // client.release(); // Release the client back to the pool
      return result.rows;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  static findById(id) {}
};
