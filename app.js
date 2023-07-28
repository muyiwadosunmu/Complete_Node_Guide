const path = require("path");

const express = require("express");

const app = express();
const PORT = 3000;

// Template engine config
app.set("view engine", "pug");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.render("404", { pageTitle: "Page Not Found" });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
