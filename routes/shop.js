const express = require("express");
const products = require("./products"); // Import products array

const router = express.Router();

router.get("/", (req, res, next) => {
  const productList = products;
  res.render("shop", {
    prods: productList,
    pageTitle: "Shop",
    path: "/",
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true,
  });
});

module.exports = router;
