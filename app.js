const path = require("path");

const express = require("express");

const app = express();
const PORT = 3000;

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/errorController");

// Template engine config
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
