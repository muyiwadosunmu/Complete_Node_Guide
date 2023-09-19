const path = require("path");
require("dotenv").config();
// console.log(process.env);

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const csrfSync = require("csrf-sync");
const flash = require("connect-flash");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");

const PORT = 3000 || process.env.PORT;
const errorController = require("./controllers/errorController");
const User = require("./models/userModel");
const MONGODB_URI = process.env.MONGODB_URI;

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const app = express();

const csrfSecret = "your-secret-key"; // Use a strong secret key for production
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, true); //Determine to store file
  }
};

const store = new MongoDBStore({
  uri: MONGODB_URI, // We could use diff implementations like Redis
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: ",my-secret-key",
    resave: false, // improves performance
    saveUninitialized: false, // makes sure unnecessary are saved
    store: store,
  })
);

/**csrf middleware should be here */
// app.use(csrfSyncProtection);
/**flash middleware */
app.use(flash());

app.use(async (req, res, next) => {
  // throw new Error('Sync Dummy');    this works like this in a synchronous code
  if (!req.session.user) {
    return next();
  }
  await User.findById(req.session.user._id) //We call a method to find user by the session
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
      //This is how you throw an error in asynchronous code in Express
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  // res.locals.csrfToken = req.session.csrfToken;
  next();
});
/**Routes */
// const myRoute = (req, res) => res.json({ token: generateToken(req) });
// app.get("/csrf-token", myRoute);
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.log(err);
  });
