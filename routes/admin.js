const path = require("path");
const express = require("express");

const router = express.Router();
const productsController = require("../controllers/productsController");

// /admin/add-product => GET
router.get("/add-product", productsController.getAddProucts);

// /admin/add-product => POST
router.post("/add-product", productsController.postAddProduct);

module.exports = router;
