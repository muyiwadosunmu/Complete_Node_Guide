const path = require("path");
const express = require("express");

const router = express.Router();
const adminController = require("../controllers/adminController");

// /admin/add-product => GET
router.get("/add-product", adminController.getAddProucts);

// /admin/products => GET
router.get("/products", adminController.getProducts);

// /admin/add-product => POST
router.post("/add-product", adminController.postAddProduct);

module.exports = router;
