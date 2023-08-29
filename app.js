const path = require("path");

const express = require("express");
const mongoose = require("mongoose")

const app = express();
const PORT = 3000;

const adminRoutes = require("./routes/adminRoute");
const shopRoutes = require("./routes/shopRoute");
const errorController = require("./controllers/errorController");
const sequelize = require("./util/DBConn");
const Product = require("./models/productModel");
const User = require("./models/userModel");

// Template engine config
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(async (req, res, next) => {
  const user = await User.findByPk(1);
  req.user = user;
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

const pool = require("./util/DBConn");
const Cart = require("./models/cartModel");
const CartItem = require("./models/cart-item");

// async function fetchData() {
//   try {
//     const client = await pool.connect();
//     console.log("postgres DB Connected");
//     const result = await client.query("SELECT * FROM products");
//     client.release(); // Release the client back to the pool
//     return result.rows;
//   } catch (error) {
//     console.error("Error executing query:", error);
//     throw error;
//   }
// }

// fetchData()
//   .then((data) => console.log(data))
//   .catch((err) => console.error("Error:", err.message));

app.use(errorController.get404);
/**Relationships */
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
/**Sync our Models to the Database */
(async () => {
  try {
    await sequelize.sync();
    let user = await User.findByPk(1);

    if (!user) {
      user = await User.create({ name: "Muyiwa", email: "test@mail.com" });
      user.createCart();
    }

    // console.log({ user });
    mongoose.connect('mongodb+srv://oluwamuyiwadosunmu:TKf5iCgZYN7n5i4K@cluster0.q6tfwsl.mongodb.net/shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(() => console.log("Connected to MongoDB"));
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.error(error);
  }
})();
